<template>
  <div class="realtime-container">
    <button 
      @click="toggleConnection" 
      :disabled="connecting"
      :class="{
        'connecting': connecting,
        'connected': connected,
        'recording': recording
      }"
      class="realtime-button"
    >
      <span v-if="connecting">Connecting...</span>
      <span v-else-if="connected && !recording">🎤 Start Recording</span>
      <span v-else-if="recording">🛑 Stop Recording</span>
      <span v-else>🗣️ Connect to AI</span>
    </button>
    
    <div v-if="status" class="status">{{ status }}</div>
    
    <div v-if="transcript" class="transcript">
      <strong>Transcript:</strong> {{ transcript }}
    </div>
    
    <div v-if="notifications.length > 0" class="notifications">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        :class="`notification notification-${notification.type}`"
      >
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useNav } from '@slidev/client'

// Access Slidev navigation
const nav = useNav()

// State management
const connecting = ref(false)
const connected = ref(false)
const recording = ref(false)
const status = ref('')
const transcript = ref('')
const notifications = ref([])

// WebRTC and audio components
let peerConnection = null
let dataChannel = null
let audioElement = null

// Backend API base URL
const API_BASE = 'http://localhost:3000'

// Status notification management
let notificationId = 0
function addStatusNotification(message, type = 'info') {
  const notification = {
    id: ++notificationId,
    message,
    type,
    timestamp: Date.now()
  }
  notifications.value.push(notification)
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    const index = notifications.value.findIndex(n => n.id === notification.id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }, 3000)
}

// Navigation function
function navigateSlide(direction) {
  try {
    if (direction === 'next') {
      nav.next()
      addStatusNotification('Navigated to next slide', 'success')
    } else if (direction === 'previous') {
      nav.prev()
      addStatusNotification('Navigated to previous slide', 'success')
    }
  } catch (error) {
    console.error('Navigation error:', error)
    addStatusNotification('Failed to navigate slide', 'error')
  }
}

// Fetch ephemeral token from backend
async function fetchEphemeralToken() {
  try {
    const response = await fetch(`${API_BASE}/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.client_secret.value
  } catch (error) {
    console.error('Failed to fetch ephemeral token:', error)
    throw error
  }
}

// Initialize WebRTC connection
async function initializeWebRTC() {
  try {
    connecting.value = true
    status.value = 'Getting ephemeral token...'
    
    const ephemeralKey = await fetchEphemeralToken()
    
    status.value = 'Setting up WebRTC connection...'
    
    // Create peer connection
    peerConnection = new RTCPeerConnection()
    
    // Set up audio element for remote audio from the model
    audioElement = document.createElement('audio')
    audioElement.autoplay = true
    audioElement.controls = false
    document.body.appendChild(audioElement)
    
    peerConnection.ontrack = (event) => {
      console.log('Received remote audio track')
      audioElement.srcObject = event.streams[0]
    }
    
    // Add local audio track for microphone input
    status.value = 'Requesting microphone access...'
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const audioTrack = mediaStream.getTracks()[0]
    peerConnection.addTrack(audioTrack, mediaStream)
    
    // Set up data channel for sending and receiving events
    dataChannel = peerConnection.createDataChannel('oai-events')
    dataChannel.addEventListener('message', handleServerEvent)
    dataChannel.addEventListener('open', () => {
      console.log('Data channel opened')
      connected.value = true
      connecting.value = false
      status.value = 'Connected! Ready to chat.'
    })
    
    // Start the session using Session Description Protocol (SDP)
    status.value = 'Establishing connection...'
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    
    const baseUrl = 'https://api.openai.com/v1/realtime'
    const model = 'gpt-4o-realtime-preview-2025-06-03'
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: 'POST',
      body: offer.sdp,
      headers: {
        'Authorization': `Bearer ${ephemeralKey}`,
        'Content-Type': 'application/sdp'
      },
    })
    
    if (!sdpResponse.ok) {
      throw new Error(`SDP exchange failed: ${sdpResponse.status}`)
    }
    
    const answer = {
      type: 'answer',
      sdp: await sdpResponse.text(),
    }
    await peerConnection.setRemoteDescription(answer)
    
    // Connection ready
    addStatusNotification('AI Assistant connected and ready!', 'success')
    
  } catch (error) {
    console.error('Failed to initialize WebRTC:', error)
    status.value = `Connection failed: ${error.message}`
    connecting.value = false
    addStatusNotification(`Connection failed: ${error.message}`, 'error')
  }
}

// Handle server events from OpenAI
function handleServerEvent(event) {
  try {
    const serverEvent = JSON.parse(event.data)
    console.log('Server event:', serverEvent)
    
    switch (serverEvent.type) {
      case 'session.created':
        console.log('Session created successfully')
        status.value = 'Session ready!'
        break
        
      case 'input_audio_buffer.speech_started':
        recording.value = true
        status.value = 'Listening...'
        break
        
      case 'input_audio_buffer.speech_stopped':
        recording.value = false
        status.value = 'Processing...'
        break
        
      case 'response.audio_transcript.delta':
        // Update transcript as model speaks
        if (serverEvent.delta) {
          transcript.value += serverEvent.delta
        }
        break
        
      case 'response.done':
        // Check if this is a function call
        if (serverEvent.response.output && serverEvent.response.output.length > 0) {
          const output = serverEvent.response.output[0]
          if (output.type === 'function_call' && output.name === 'navigate_slide') {
            handleNavigationCall(output)
          }
        }
        status.value = 'Response complete. Say something!'
        break
        
      case 'error':
        console.error('Server error:', serverEvent)
        status.value = `Error: ${serverEvent.message}`
        addStatusNotification(`AI Error: ${serverEvent.message}`, 'error')
        break
    }
  } catch (error) {
    console.error('Failed to parse server event:', error)
  }
}

// Handle navigation calls from the model
async function handleNavigationCall(functionCall) {
  try {
    console.log('Navigation call received:', functionCall)
    
    const args = JSON.parse(functionCall.arguments)
    const { direction, confirmation } = args
    
    // Execute the navigation tool via backend
    const response = await fetch(`${API_BASE}/api/tool/navigate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ direction, confirmation }),
    })
    
    const result = await response.json()
    
    if (response.ok) {
      // Perform the actual slide navigation
      navigateSlide(direction)
      
      // Send function result back to the model
      const functionResult = {
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: functionCall.call_id,
          output: JSON.stringify(result)
        }
      }
      
      dataChannel.send(JSON.stringify(functionResult))
      
      // Create a new response
      const responseCreate = {
        type: 'response.create'
      }
      dataChannel.send(JSON.stringify(responseCreate))
      
    } else {
      console.error('Navigation execution failed:', result)
      addStatusNotification('Failed to execute navigation', 'error')
    }
    
  } catch (error) {
    console.error('Failed to handle navigation call:', error)
    addStatusNotification('Error processing navigation', 'error')
  }
}

// Disconnect from the session
function disconnect() {
  if (peerConnection) {
    peerConnection.close()
    peerConnection = null
  }
  
  if (dataChannel) {
    dataChannel.close()
    dataChannel = null
  }
  
  if (audioElement) {
    audioElement.remove()
    audioElement = null
  }
  
  connected.value = false
  connecting.value = false
  recording.value = false
  status.value = ''
  transcript.value = ''
}

// Toggle connection state
async function toggleConnection() {
  if (connected.value) {
    disconnect()
  } else {
    await initializeWebRTC()
  }
}

// Cleanup on component unmount
onUnmounted(() => {
  disconnect()
})
</script>

<style scoped>
.realtime-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.realtime-button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  border: 2px solid #007acc;
  border-radius: 8px;
  background: linear-gradient(135deg, #007acc, #0056b3);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}

.realtime-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #0056b3, #004494);
  transform: translateY(-2px);
}

.realtime-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.realtime-button.connecting {
  background: linear-gradient(135deg, #ffa500, #ff8c00);
  animation: pulse 1.5s infinite;
}

.realtime-button.connected {
  background: linear-gradient(135deg, #28a745, #1e7e34);
}

.realtime-button.recording {
  background: linear-gradient(135deg, #dc3545, #c82333);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.status {
  font-size: 0.9rem;
  color: #666;
  text-align: center;
}

.transcript {
  font-size: 0.9rem;
  color: #333;
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  max-width: 100%;
  word-wrap: break-word;
}

.notifications {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.notification {
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
  animation: slideIn 0.3s ease;
}

.notification-info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.notification-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.notification-warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.notification-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
