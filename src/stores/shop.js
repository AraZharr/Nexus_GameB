import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useShopStore = defineStore('shop', () => {
  const shopItems = ref([])
  const themes = ref([])
  const loading = ref(false)
  const error = ref(null)

  const userId = ref(null)

  // Initialize with user ID
  const setUserId = (id) => {
    userId.value = id
  }

  // Fetch shop items from Supabase, optionally filtered by category
  const fetchShopItems = async (category = null) => {
    loading.value = true
    error.value = null
    try {
      let query = supabase.from('shop_items').select('*')

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error: err } = await query.order('price_koin')

      if (err) throw err
      shopItems.value = data || []
    } catch (e) {
      error.value = e.message
      console.error('Failed to fetch shop items:', e)
    } finally {
      loading.value = false
    }
  }

  // Fetch themes from Supabase
  const fetchThemes = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('themes')
        .select('*')
        .order('name')

      if (err) throw err
      themes.value = data || []
    } catch (e) {
      error.value = e.message
      console.error('Failed to fetch themes:', e)
    } finally {
      loading.value = false
    }
  }

  // Purchase a shop item (skin, etc.)
  const purchaseItem = async (itemId, uid = userId.value) => {
    if (!uid) throw new Error('User not authenticated')

    const item = shopItems.value.find(i => i.id === itemId)
    if (!item) throw new Error('Item not found')

    try {
      // Check if item is already owned
      const { data: owned, error: ownedErr } = await supabase
        .from('user_inventory')
        .select('id')
        .eq('user_id', uid)
        .eq('item_id', itemId)
        .eq('item_type', 'skin')
        .single()

      if (!ownedErr && owned) {
        throw new Error('Item already owned')
      }

      // Get user balance
      const { data: userData, error: userErr } = await supabase
        .from('profiles')
        .select('koin_balance, diamond_balance')
        .eq('id', uid)
        .single()

      if (userErr) throw userErr

      // Determine which currency to use
      const currency = item.currency || 'koin'
      const balanceKey =
        currency === 'diamond' ? 'diamond_balance' : 'koin_balance'
      const price = currency === 'diamond' ? item.price_diamond : item.price_koin

      // Check balance
      if (userData[balanceKey] < price) {
        throw new Error(`Insufficient ${currency === 'diamond' ? 'Diamond' : 'Koin'}`)
      }

      // Deduct currency
      const updateData = {
        [balanceKey]: userData[balanceKey] - price
      }

      const { error: updateErr } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', uid)

      if (updateErr) throw updateErr

      // Add to inventory
      const { error: inventoryErr } = await supabase
        .from('user_inventory')
        .insert({
          user_id: uid,
          item_id: itemId,
          item_type: 'skin',
          acquired_at: new Date().toISOString()
        })

      if (inventoryErr) throw inventoryErr

      return { success: true, message: `Purchased ${item.name}` }
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  // Purchase a theme
  const purchaseTheme = async (themeId, uid = userId.value) => {
    if (!uid) throw new Error('User not authenticated')

    const theme = themes.value.find(t => t.id === themeId)
    if (!theme) throw new Error('Theme not found')

    try {
      // Check if theme is already owned
      const { data: owned, error: ownedErr } = await supabase
        .from('user_inventory')
        .select('id')
        .eq('user_id', uid)
        .eq('theme_id', themeId)
        .eq('item_type', 'theme')
        .single()

      if (!ownedErr && owned) {
        throw new Error('Theme already owned')
      }

      // Get user balance
      const { data: userData, error: userErr } = await supabase
        .from('profiles')
        .select('koin_balance, diamond_balance')
        .eq('id', uid)
        .single()

      if (userErr) throw userErr

      // Determine currency
      const currency = theme.currency || 'diamond'
      const balanceKey =
        currency === 'diamond' ? 'diamond_balance' : 'koin_balance'
      const price = currency === 'diamond' ? theme.price_diamond : theme.price_koin

      // Check balance
      if (userData[balanceKey] < price) {
        throw new Error(`Insufficient ${currency === 'diamond' ? 'Diamond' : 'Koin'}`)
      }

      // Deduct currency
      const updateData = {
        [balanceKey]: userData[balanceKey] - price
      }

      const { error: updateErr } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', uid)

      if (updateErr) throw updateErr

      // Add to inventory
      const { error: inventoryErr } = await supabase
        .from('user_inventory')
        .insert({
          user_id: uid,
          theme_id: themeId,
          item_type: 'theme',
          acquired_at: new Date().toISOString()
        })

      if (inventoryErr) throw inventoryErr

      return { success: true, message: `Purchased ${theme.name}` }
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  // Get item by ID
  const getItemById = (itemId) => {
    return shopItems.value.find(i => i.id === itemId)
  }

  // Get theme by ID
  const getThemeById = (themeId) => {
    return themes.value.find(t => t.id === themeId)
  }

  return {
    // State
    shopItems,
    themes,
    loading,
    error,

    // Methods
    setUserId,
    fetchShopItems,
    fetchThemes,
    purchaseItem,
    purchaseTheme,
    getItemById,
    getThemeById
  }
})
