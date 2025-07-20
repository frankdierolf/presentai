import { usePocketbase } from '@/composables/usePocketbase'

interface SyncResults {
  user_id: string
  email: string
  customer_found: boolean
  customer_id: string | null
  checkout_sessions: {
    checked: number
    processed: number
  }
  subscriptions: {
    checked: number
    processed: number
    active: number
  }
  user_updated: boolean
  pro_status_before: boolean
  pro_status_after: boolean | null
  errors: string[]
}

interface SyncResponse {
  success: boolean
  message: string
  results?: SyncResults
  error?: string
  timestamp: string
}

interface SyncStatus {
  user: {
    id: string
    email: string
    pro_account: boolean
  }
  customer: {
    exists: boolean
    stripe_customer_id?: string
    created?: string
  }
  subscription: {
    exists: boolean
    subscription_id?: string
    status?: string
    created?: string
  }
  timestamp: string
}

export const useStripeSync = () => {
  const { pb } = usePocketbase()
  
  const isSyncing = ref(false)
  const lastSyncResult = ref<SyncResponse | null>(null)
  const syncError = ref<string | null>(null)
  const syncStatus = ref<SyncStatus | null>(null)

  const syncWithStripe = async (): Promise<SyncResponse> => {
    isSyncing.value = true
    syncError.value = null
    lastSyncResult.value = null

    try {
      console.log('🔄 Starting manual Stripe sync...')
      
      const response = await $fetch<SyncResponse>('/api/sync-stripe', {
        method: 'POST',
        baseURL: useRuntimeConfig().public.pocketbaseUrl,
        headers: {
          'Authorization': pb.authStore.token || '',
          'Content-Type': 'application/json'
        }
      })

      lastSyncResult.value = response
      
      if (response.success) {
        console.log('✅ Sync completed successfully:', response.message)
        if (response.results?.user_updated) {
          console.log(`🏆 Pro status changed: ${response.results.pro_status_before} → ${response.results.pro_status_after}`)
        }
      } else {
        console.error('❌ Sync failed:', response.error)
        syncError.value = response.error || 'Sync failed'
      }

      return response

    } catch (error: any) {
      console.error('❌ Sync request failed:', error)
      const errorMessage = error.data?.error || error.message || 'Failed to sync with Stripe'
      syncError.value = errorMessage
      
      const errorResponse: SyncResponse = {
        success: false,
        error: errorMessage,
        message: 'Sync request failed',
        timestamp: new Date().toISOString()
      }
      
      lastSyncResult.value = errorResponse
      return errorResponse
      
    } finally {
      isSyncing.value = false
    }
  }

  const getSyncStatus = async (): Promise<SyncStatus | null> => {
    try {
      console.log('📊 Fetching sync status...')
      
      const response = await $fetch<{ success: boolean } & SyncStatus>('/api/sync-status', {
        method: 'GET',
        baseURL: useRuntimeConfig().public.pocketbaseUrl,
        headers: {
          'Authorization': pb.authStore.token || ''
        }
      })

      if (response.success) {
        syncStatus.value = response
        return response
      } else {
        console.error('❌ Failed to get sync status')
        return null
      }

    } catch (error: any) {
      console.error('❌ Sync status request failed:', error)
      return null
    }
  }

  const clearSyncState = () => {
    lastSyncResult.value = null
    syncError.value = null
    syncStatus.value = null
  }

  // Auto-fetch status on mount
  onMounted(() => {
    if (pb.authStore.isValid) {
      getSyncStatus()
    }
  })

  return {
    // State
    isSyncing: readonly(isSyncing),
    lastSyncResult: readonly(lastSyncResult),
    syncError: readonly(syncError),
    syncStatus: readonly(syncStatus),
    
    // Actions
    syncWithStripe,
    getSyncStatus,
    clearSyncState,
    
    // Computed
    hasCustomer: computed(() => syncStatus.value?.customer.exists || false),
    hasSubscription: computed(() => syncStatus.value?.subscription.exists || false),
    isProUser: computed(() => syncStatus.value?.user.pro_account || false),
    canSync: computed(() => !isSyncing.value && pb.authStore.isValid),
    
    // Helper for displaying sync results
    syncSummary: computed(() => {
      const result = lastSyncResult.value
      if (!result?.results) return null
      
      return {
        sessionsProcessed: result.results.checkout_sessions.processed,
        subscriptionsProcessed: result.results.subscriptions.processed,
        activeSubscriptions: result.results.subscriptions.active,
        proStatusChanged: result.results.user_updated,
        hasErrors: result.results.errors.length > 0,
        errorCount: result.results.errors.length
      }
    })
  }
}