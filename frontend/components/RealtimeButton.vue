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
      <span v-else-if="connected && !recording">🎤 Voice Commands Active</span>
      <span v-else-if="recording">🎤 Listening...</span>
      <span v-else>🗣️ Enable Voice Commands</span>
    </button>
    
    <div v-if="status" class="status">{{ status }}</div>
    
    <div v-if="connected" class="voice-mode-indicator" :class="{ 'voice-enabled': voiceModeEnabled }">
      <span v-if="voiceModeEnabled">🔊 Voice Mode: ON</span>
      <span v-else>🔇 Voice Mode: OFF</span>
    </div>
    
    <div v-if="transcript" class="transcript">
      <strong>You said:</strong> {{ transcript }}
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
const voiceModeEnabled = ref(false)
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

// Voice mode controls
function enableVoiceMode() {
  voiceModeEnabled.value = true
  addStatusNotification('Voice mode enabled - you will hear AI responses', 'success')
  
  // Enable audio playback if audio element exists
  if (audioElement) {
    audioElement.volume = 1.0
    audioElement.muted = false
  }
}

function disableVoiceMode() {
  voiceModeEnabled.value = false
  addStatusNotification('Voice mode disabled - silent mode active', 'info')
  
  // Disable audio playback if audio element exists
  if (audioElement) {
    audioElement.volume = 0.0
    audioElement.muted = true
  }
}

// Get current slide content for feedback
function getCurrentSlideContent() {
  try {
// Use Slidev's navigation API to get current slide data
const currentSlide = nav.currentSlideRoute.value

    if (!currentSlide) {
      return 'Unable to access current slide route'
    }
    
    // Try to get content from the slide metadata
    let slideContent = ''
    
    // Check if we have slide metadata with content
    if (currentSlide.meta?.slide) {
      const slideData = currentSlide.meta.slide
      
      // Try to get the raw content (markdown source)
      if (slideData.content) {
        slideContent = slideData.content
      }
      // Try to get from note if content is not available
      else if (slideData.note) {
        slideContent = `Note: ${slideData.note}`
      }
      // Try frontmatter title
      else if (slideData.frontmatter?.title) {
        slideContent = slideData.frontmatter.title
      }
    }
    
    // If we still don't have content, try to extract from DOM as fallback
    if (!slideContent || slideContent.trim().length < 5) {
      const slideElement = document.querySelector('.slidev-page')
      if (slideElement) {
        // Clone and clean the element
        const clonedElement = slideElement.cloneNode(true)
        
        // Remove unwanted elements
        const unwantedSelectors = [
          '.slidev-nav',
          '.slidev-controls', 
          'script',
          'style',
          'button',
          '.slidev-icon-btn'
        ]
        
        unwantedSelectors.forEach(selector => {
          const elements = clonedElement.querySelectorAll(selector)
          elements.forEach(el => el.remove())
        })
        
        slideContent = clonedElement.textContent || clonedElement.innerText || ''
        slideContent = slideContent
          .replace(/\s+/g, ' ')
          .replace(/Welcome to Slidev|Presentation slides for developers|Press Space for next page/gi, '')
          .trim()
      }
    }
    
    // Clean up markdown syntax if present
    if (slideContent) {
      slideContent = slideContent
        .replace(/^#{1,6}\s+/gm, '') // Remove markdown headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
        .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
        .replace(/`(.*?)`/g, '$1') // Remove inline code markdown
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
    }
    
    // Fallback if still no meaningful content
    if (!slideContent || slideContent.length < 10) {
      const slideNumber = nav.currentPage.value
      slideContent = `This appears to be slide ${slideNumber} with minimal text content, primarily visual elements, or content that couldn't be extracted.`
    }
    
    console.log('Extracted slide content:', slideContent)
    return slideContent
    
  } catch (error) {
    console.error('Error extracting slide content:', error)
    return `Unable to extract content from slide ${nav.currentPage.value}. This might be a visual-heavy slide.`
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
    
    status.value = 'Setting up voice commands...'
    
    // Create peer connection
    peerConnection = new RTCPeerConnection()
    
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
      status.value = 'Voice commands ready! Say "next slide", "previous slide", "enable voice", "disable voice", or ask for feedback!'
    })
    
    // Handle incoming audio track for voice output
    peerConnection.addEventListener('track', (event) => {
      const [remoteStream] = event.streams
      console.log('Received remote audio stream')
      
      // Create audio element if it doesn't exist
      if (!audioElement) {
        audioElement = new Audio()
        audioElement.autoplay = true
      }
      
      // Always set the stream, but control playback with volume
      audioElement.srcObject = remoteStream
      
      // Control audio playback based on voice mode
      if (voiceModeEnabled.value) {
        audioElement.volume = 1.0
        audioElement.muted = false
      } else {
        audioElement.volume = 0.0
        audioElement.muted = true
      }
      
      audioElement.play().catch(error => {
        console.error('Error playing audio:', error)
      })
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
    addStatusNotification('Voice commands activated!', 'success')
    
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
    // console.log('Server event:', serverEvent)
    
    switch (serverEvent.type) {
      case 'session.created':
        console.log('Session created successfully')
        status.value = 'Voice commands ready!'
        break
        
      case 'input_audio_buffer.speech_started':
        recording.value = true
        status.value = 'Listening for commands...'
        break
        
      case 'input_audio_buffer.speech_stopped':
        recording.value = false
        status.value = 'Processing command...'
        break
        
      case 'conversation.item.input_audio_transcription.completed':
        // Show what the user said
        if (serverEvent.transcript) {
          transcript.value = serverEvent.transcript
        }
        break
        
      case 'response.done':
        // Check if this is a function call
        if (serverEvent.response.output && serverEvent.response.output.length > 0) {
          const output = serverEvent.response.output[0]
          if (output.type === 'function_call') {
            switch (output.name) {
              case 'navigate_slide':
                handleNavigationCall(output)
                break
              case 'enable_voice':
                handleVoiceControlCall(output, 'enable')
                break
              case 'disable_voice':
                handleVoiceControlCall(output, 'disable')
                break
              case 'get_slide_feedback':
                handleFeedbackCall(output)
                break
            }
          }
        }
        status.value = 'Ready for next command...'
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

// Handle voice control calls from the model
async function handleVoiceControlCall(functionCall, action) {
  try {
    console.log('Voice control call received:', functionCall, action)
    
    const endpoint = action === 'enable' ? '/api/tool/enable-voice' : '/api/tool/disable-voice'
    
    // Execute the voice control tool via backend
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
    
    const result = await response.json()
    
    if (response.ok) {
      // Perform the actual voice mode change
      if (action === 'enable') {
        enableVoiceMode()
      } else {
        disableVoiceMode()
      }
      
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
      console.error('Voice control execution failed:', result)
      addStatusNotification('Failed to execute voice control', 'error')
    }
    
  } catch (error) {
    console.error('Failed to handle voice control call:', error)
    addStatusNotification('Error processing voice control', 'error')
  }
}

// Handle feedback calls from the model
async function handleFeedbackCall(functionCall) {
  try {
    console.log('Feedback call received:', functionCall)
    
    // Get current slide content
    const slideContent = getCurrentSlideContent()
    console.log('Current slide content:', slideContent)
    const slideNumber = nav.currentPage.value
    
    addStatusNotification('Analyzing current slide for feedback...', 'info')
    
    // Execute the feedback tool via backend
    const response = await fetch(`${API_BASE}/api/tool/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        slideContent,
        slideNumber
      }),
    })
    
    const result = await response.json()
    
    if (response.ok) {
      // Send function result back to the model with slide content
      const functionResult = {
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: functionCall.call_id,
          output: JSON.stringify({
            ...result,
            slideContent,
            slideNumber,
            instruction: 'Please provide enthusiastic and constructive feedback on this slide content.'
          })
        }
      }
      
      dataChannel.send(JSON.stringify(functionResult))
      
      // Create a new response to get AI feedback
      const responseCreate = {
        type: 'response.create'
      }
      dataChannel.send(JSON.stringify(responseCreate))
      
      addStatusNotification('Getting AI feedback on your slide...', 'success')
      
    } else {
      console.error('Feedback execution failed:', result)
      addStatusNotification('Failed to get slide feedback', 'error')
    }
    
  } catch (error) {
    console.error('Failed to handle feedback call:', error)
    addStatusNotification('Error processing feedback request', 'error')
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
    audioElement.pause()
    audioElement.srcObject = null
    audioElement = null
  }
  
  connected.value = false
  connecting.value = false
  recording.value = false
  voiceModeEnabled.value = false
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

.voice-mode-indicator {
  font-size: 0.9rem;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  background: #f8f9fa;
  color: #6c757d;
  border: 2px solid #dee2e6;
}

.voice-mode-indicator.voice-enabled {
  background: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
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
