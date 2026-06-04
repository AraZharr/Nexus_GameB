import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';

export const useRoomStore = defineStore('room', () => {
  // State
  const currentRoom = ref(null);
  const players = ref([]);
  const readyStatus = ref({});
  const roomList = ref([]);
  const matchmakingQueue = ref([]);
  const currentUser = ref(null);
  let roomSubscription = null;
  let playersSubscription = null;

  // Utility: Generate 6-character room ID
  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Create room
  const createRoom = async (config) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      currentUser.value = user;

      const roomId = generateRoomId();
      const roomData = {
        id: roomId,
        host_id: user.id,
        game_type: config.gameType,
        mode: config.mode || 'classic',
        skills_enabled: config.skillsEnabled || false,
        betting_enabled: config.bettingEnabled || false,
        betting_min: config.bettingMin || 50,
        betting_max: config.bettingMax || 1000,
        max_players: config.maxPlayers || 2,
        timer_seconds: config.timer || 300,
        is_private: config.isPrivate || false,
        pin: config.pin || null,
        status: 'waiting',
        pot_total: 0,
      };

      const { data, error } = await supabase
        .from('rooms')
        .insert([roomData])
        .select();

      if (error) throw error;

      currentRoom.value = data[0];

      // Auto-join as host
      await joinRoom(roomId);

      return data[0];
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  // Join room
  const joinRoom = async (roomId, pin = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      currentUser.value = user;

      // Verify room exists
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) throw new Error('Room not found');

      // Verify PIN if private
      if (roomData.is_private && roomData.pin !== pin) {
        throw new Error('Invalid PIN');
      }

      // Check max players
      const { data: playerCount, error: countError } = await supabase
        .from('room_players')
        .select('*', { count: 'exact' })
        .eq('room_id', roomId)
        .eq('is_spectator', false);

      if (countError) throw countError;

      if (playerCount.length >= roomData.max_players) {
        throw new Error('Room is full');
      }

      // Add player to room
      const { data, error } = await supabase
        .from('room_players')
        .insert([
          {
            room_id: roomId,
            user_id: user.id,
            ready: false,
            bet_amount: 0,
            is_spectator: false,
          },
        ])
        .select();

      if (error) {
        if (error.code === '23505') {
          console.log('Already in room');
        } else {
          throw error;
        }
      }

      currentRoom.value = roomData;
      await subscribeToRoom(roomId);

      return roomData;
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  };

  // Leave room
  const leaveRoom = async () => {
    try {
      if (!currentRoom.value) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user is host
      const isHost = currentRoom.value.host_id === user.id;

      // Remove from room_players
      const { error } = await supabase
        .from('room_players')
        .delete()
        .eq('room_id', currentRoom.value.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // If host, migrate host role
      if (isHost) {
        await migrateHost();
      }

      unsubscribeFromRoom();
      currentRoom.value = null;
      players.value = [];
      readyStatus.value = {};
    } catch (error) {
      console.error('Error leaving room:', error);
      throw error;
    }
  };

  // Kick player
  const kickPlayer = async (playerId) => {
    try {
      if (!currentRoom.value) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user || currentRoom.value.host_id !== user.id) {
        throw new Error('Only host can kick players');
      }

      const { error } = await supabase
        .from('room_players')
        .delete()
        .eq('room_id', currentRoom.value.id)
        .eq('user_id', playerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error kicking player:', error);
      throw error;
    }
  };

  // Toggle ready status
  const toggleReady = async () => {
    try {
      if (!currentRoom.value) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const currentReady = readyStatus.value[user.id] || false;

      const { error } = await supabase
        .from('room_players')
        .update({ ready: !currentReady })
        .eq('room_id', currentRoom.value.id)
        .eq('user_id', user.id);

      if (error) throw error;

      readyStatus.value[user.id] = !currentReady;
    } catch (error) {
      console.error('Error toggling ready:', error);
      throw error;
    }
  };

  // Start match
  const startMatch = async () => {
    try {
      if (!currentRoom.value) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user || currentRoom.value.host_id !== user.id) {
        throw new Error('Only host can start match');
      }

      // Check all players ready
      const allReady = players.value.every((p) => readyStatus.value[p.user_id] || p.user_id === user.id);
      if (!allReady) {
        throw new Error('Not all players are ready');
      }

      const { error } = await supabase
        .from('rooms')
        .update({ status: 'playing' })
        .eq('id', currentRoom.value.id);

      if (error) throw error;

      currentRoom.value.status = 'playing';
    } catch (error) {
      console.error('Error starting match:', error);
      throw error;
    }
  };

  // Fetch public rooms
  const fetchPublicRooms = async (gameType = null) => {
    try {
      let query = supabase
        .from('rooms')
        .select('*')
        .eq('status', 'waiting')
        .eq('is_private', false);

      if (gameType) {
        query = query.eq('game_type', gameType);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      roomList.value = data;
      return data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  };

  // Spectate room
  const spectateRoom = async (roomId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      currentUser.value = user;

      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) throw new Error('Room not found');

      const { data, error } = await supabase
        .from('room_players')
        .insert([
          {
            room_id: roomId,
            user_id: user.id,
            ready: false,
            bet_amount: 0,
            is_spectator: true,
          },
        ])
        .select();

      if (error) {
        if (error.code !== '23505') throw error;
      }

      currentRoom.value = roomData;
      await subscribeToRoom(roomId);

      return roomData;
    } catch (error) {
      console.error('Error spectating room:', error);
      throw error;
    }
  };

  // Migrate host
  const migrateHost = async () => {
    try {
      if (!currentRoom.value) return;

      // Get remaining players sorted by joined_at
      const { data: remainingPlayers, error } = await supabase
        .from('room_players')
        .select('user_id, joined_at')
        .eq('room_id', currentRoom.value.id)
        .eq('is_spectator', false)
        .order('joined_at', { ascending: true })
        .limit(1);

      if (error) throw error;

      if (remainingPlayers && remainingPlayers.length > 0) {
        const newHostId = remainingPlayers[0].user_id;

        const { error: updateError } = await supabase
          .from('rooms')
          .update({ host_id: newHostId })
          .eq('id', currentRoom.value.id);

        if (updateError) throw updateError;

        if (currentRoom.value) {
          currentRoom.value.host_id = newHostId;
        }
      }
    } catch (error) {
      console.error('Error migrating host:', error);
    }
  };

  // Update room config
  const updateRoomConfig = async (updates) => {
    try {
      if (!currentRoom.value) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user || currentRoom.value.host_id !== user.id) {
        throw new Error('Only host can update room');
      }

      const { error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', currentRoom.value.id);

      if (error) throw error;

      currentRoom.value = { ...currentRoom.value, ...updates };
    } catch (error) {
      console.error('Error updating room config:', error);
      throw error;
    }
  };

  // Subscribe to room updates
  const subscribeToRoom = async (roomId) => {
    try {
      unsubscribeFromRoom();

      // Subscribe to room changes
      roomSubscription = supabase
        .channel(`room:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'rooms',
            filter: `id=eq.${roomId}`,
          },
          (payload) => {
            if (payload.eventType === 'UPDATE') {
              currentRoom.value = payload.new;
            }
          }
        )
        .subscribe();

      // Subscribe to room players
      playersSubscription = supabase
        .channel(`room_players:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'room_players',
            filter: `room_id=eq.${roomId}`,
          },
          async (payload) => {
            // Refetch players
            await fetchRoomPlayers(roomId);
          }
        )
        .subscribe();
    } catch (error) {
      console.error('Error subscribing to room:', error);
    }
  };

  // Fetch room players
  const fetchRoomPlayers = async (roomId) => {
    try {
      const { data, error } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', roomId);

      if (error) throw error;

      players.value = data;

      // Update ready status
      const newReadyStatus = {};
      data.forEach((player) => {
        newReadyStatus[player.user_id] = player.ready;
      });
      readyStatus.value = newReadyStatus;
    } catch (error) {
      console.error('Error fetching room players:', error);
    }
  };

  // Unsubscribe from room
  const unsubscribeFromRoom = async () => {
    if (roomSubscription) {
      await supabase.removeChannel(roomSubscription);
      roomSubscription = null;
    }
    if (playersSubscription) {
      await supabase.removeChannel(playersSubscription);
      playersSubscription = null;
    }
  };

  // Computed
  const isHost = computed(() => {
    if (!currentRoom.value || !currentUser.value) return false;
    return currentRoom.value.host_id === currentUser.value.id;
  });

  const allPlayersReady = computed(() => {
    return players.value.every((p) => readyStatus.value[p.user_id] || p.is_spectator);
  });

  const canStartGame = computed(() => {
    return isHost.value && allPlayersReady.value && players.value.length > 0;
  });

  return {
    currentRoom,
    players,
    readyStatus,
    roomList,
    matchmakingQueue,
    currentUser,
    isHost,
    allPlayersReady,
    canStartGame,
    createRoom,
    joinRoom,
    leaveRoom,
    kickPlayer,
    toggleReady,
    startMatch,
    fetchPublicRooms,
    spectateRoom,
    migrateHost,
    updateRoomConfig,
    subscribeToRoom,
    unsubscribeFromRoom,
    fetchRoomPlayers,
  };
});
