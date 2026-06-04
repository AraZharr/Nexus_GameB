import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

/**
 * Realtime composable - Supabase realtime channel subscription
 * Handles presence tracking and broadcast messages
 */
export const useRealtime = () => {
  const channel = ref(null)
  const roomId = ref(null)
  const presenceUsers = ref([])
  const isConnected = ref(false)
  const lastError = ref(null)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = ref(1000)

  // Callbacks for realtime events
  const onMoveCallbacks = ref([])
  const onPresenceChangeCallbacks = ref([])
  const onBroadcastCallbacks = ref([])

  /**
   * Join a realtime channel
   * @param {string} rId - Room ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const joinChannel = async (rId) => {
    if (!rId) {
      return { success: false, error: 'Room ID is required' }
    }

    try {
      roomId.value = rId
      const channelName = `room:${rId}`

      // Create or get channel
      channel.value = supabase.channel(channelName, {
        config: {
          presence: {
            key: `user-${Date.now()}`
          }
        }
      })

      // Set up presence listeners
      channel.value.on('presence', { event: 'sync' }, () => {
        const presenceState = channel.value.presenceState()
        presenceUsers.value = Object.keys(presenceState).map(key => {
          const presence = presenceState[key][0]
          return {
            id: key,
            ...presence,
            online_at: presence.online_at
          }
        })
        triggerPresenceChangeCallbacks(presenceUsers.value)
      })

      channel.value.on('presence', { event: 'join' }, ({ newPresences }) => {
        presenceUsers.value = [
          ...presenceUsers.value,
          ...newPresences.map(p => ({
            ...p,
            online_at: p.online_at
          }))
        ]
        triggerPresenceChangeCallbacks(presenceUsers.value)
      })

      channel.value.on('presence', { event: 'leave' }, ({ leftPresences }) => {
        presenceUsers.value = presenceUsers.value.filter(
          user => !leftPresences.some(p => p.user_id === user.user_id)
        )
        triggerPresenceChangeCallbacks(presenceUsers.value)
      })

      // Set up broadcast listeners for game moves
      channel.value.on('broadcast', { event: 'move' }, ({ payload }) => {
        triggerMoveCallbacks(payload)
      })

      // Set up generic broadcast listener
      channel.value.on('broadcast', { event: '*' }, ({ payload, event }) => {
        triggerBroadcastCallbacks({ event, payload })
      })

      // Subscribe to channel
      const status = await channel.value.subscribe()

      if (status === 'SUBSCRIBED') {
        isConnected.value = true
        lastError.value = null
        reconnectAttempts.value = 0
        reconnectDelay.value = 1000

        // Send presence
        await channel.value.track({
          online_at: new Date().toISOString(),
          user_id: crypto.randomUUID()
        })

        return { success: true }
      } else {
        return { success: false, error: `Subscription status: ${status}` }
      }
    } catch (error) {
      lastError.value = error.message
      console.error('Error joining channel:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Leave the current channel
   * @returns {Promise<void>}
   */
  const leaveChannel = async () => {
    if (!channel.value) return

    try {
      await channel.value.unsubscribe()
      isConnected.value = false
      presenceUsers.value = []
      channel.value = null
      roomId.value = null
    } catch (error) {
      console.error('Error leaving channel:', error)
      lastError.value = error.message
    }
  }

  /**
   * Broadcast a move to other players
   * @param {Object} move - Move object {from, to, piece, timestamp, playerId}
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const broadcastMove = async (move) => {
    if (!channel.value || !isConnected.value) {
      return { success: false, error: 'Not connected to channel' }
    }

    try {
      const movePayload = {
        ...move,
        timestamp: move.timestamp || Date.now(),
        roomId: roomId.value
      }

      const response = await channel.value.send({
        type: 'broadcast',
        event: 'move',
        payload: movePayload
      })

      return { success: true, response }
    } catch (error) {
      console.error('Error broadcasting move:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Broadcast a custom message
   * @param {string} event - Event name
   * @param {Object} payload - Message payload
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const broadcastMessage = async (event, payload) => {
    if (!channel.value || !isConnected.value) {
      return { success: false, error: 'Not connected to channel' }
    }

    try {
      const response = await channel.value.send({
        type: 'broadcast',
        event,
        payload: {
          ...payload,
          timestamp: Date.now()
        }
      })

      return { success: true, response }
    } catch (error) {
      console.error('Error broadcasting message:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Register callback for move events
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  const onMove = (callback) => {
    onMoveCallbacks.value.push(callback)
    return () => {
      onMoveCallbacks.value = onMoveCallbacks.value.filter(cb => cb !== callback)
    }
  }

  /**
   * Register callback for presence changes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  const onPresenceChange = (callback) => {
    onPresenceChangeCallbacks.value.push(callback)
    return () => {
      onPresenceChangeCallbacks.value = onPresenceChangeCallbacks.value.filter(cb => cb !== callback)
    }
  }

  /**
   * Register callback for broadcast events
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  const onBroadcast = (callback) => {
    onBroadcastCallbacks.value.push(callback)
    return () => {
      onBroadcastCallbacks.value = onBroadcastCallbacks.value.filter(cb => cb !== callback)
    }
  }

  /**
   * Trigger all registered move callbacks
   * @param {Object} move - Move data
   */
  const triggerMoveCallbacks = (move) => {
    onMoveCallbacks.value.forEach(callback => {
      try {
        callback(move)
      } catch (error) {
        console.error('Error in move callback:', error)
      }
    })
  }

  /**
   * Trigger all registered presence callbacks
   * @param {Array} users - User presence list
   */
  const triggerPresenceChangeCallbacks = (users) => {
    onPresenceChangeCallbacks.value.forEach(callback => {
      try {
        callback(users)
      } catch (error) {
        console.error('Error in presence callback:', error)
      }
    })
  }

  /**
   * Trigger all registered broadcast callbacks
   * @param {Object} data - Broadcast data
   */
  const triggerBroadcastCallbacks = (data) => {
    onBroadcastCallbacks.value.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Error in broadcast callback:', error)
      }
    })
  }

  /**
   * Attempt to reconnect to channel
   * Uses exponential backoff
   * @returns {Promise<{success: boolean}>}
   */
  const reconnect = async () => {
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      lastError.value = 'Max reconnection attempts reached'
      return { success: false }
    }

    reconnectAttempts.value += 1
    await new Promise(resolve => setTimeout(resolve, reconnectDelay.value))
    reconnectDelay.value = Math.min(reconnectDelay.value * 2, 30000) // Max 30 seconds

    if (roomId.value) {
      return joinChannel(roomId.value)
    }

    return { success: false }
  }

  /**
   * Get online users count
   */
  const onlineCount = computed(() => presenceUsers.value.length)

  /**
   * Check if we're the only user in the room
   */
  const isAlone = computed(() => presenceUsers.value.length <= 1)

  return {
    // State
    channel,
    roomId,
    presenceUsers,
    isConnected,
    lastError,
    reconnectAttempts,
    onlineCount,
    isAlone,

    // Methods
    joinChannel,
    leaveChannel,
    broadcastMove,
    broadcastMessage,
    onMove,
    onPresenceChange,
    onBroadcast,
    reconnect
  }
}
