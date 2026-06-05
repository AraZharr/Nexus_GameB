import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const ROLES = ['owner', 'admin', 'moderator', 'user']
const ROLE_LEVELS = { owner: 4, admin: 3, moderator: 2, user: 1 }
const ROLE_LABELS = { owner: 'Owner', admin: 'Admin', moderator: 'Moderator', user: 'User' }
const ROLE_COLORS = {
  owner: 'bg-red-600 text-white',
  admin: 'bg-orange-600 text-white',
  moderator: 'bg-blue-600 text-white',
  user: 'bg-slate-600 text-slate-200',
}

export function useRBAC() {
  const authStore = useAuthStore()

  const currentRole = computed(() => authStore.user?.role || 'user')
  const currentLevel = computed(() => ROLE_LEVELS[currentRole.value] || 0)

  const canAccessAdmin = computed(() => currentLevel.value >= ROLE_LEVELS.moderator)
  const canManageUsers = computed(() => currentLevel.value >= ROLE_LEVELS.admin)
  const canPromoteRoles = computed(() => currentLevel.value >= ROLE_LEVELS.admin)
  const canManageShop = computed(() => currentLevel.value >= ROLE_LEVELS.admin)
  const canManageEconomy = computed(() => currentLevel.value >= ROLE_LEVELS.admin)
  const canBanUsers = computed(() => currentLevel.value >= ROLE_LEVELS.moderator)
  const canAssignOwnerRole = computed(() => currentLevel.value >= ROLE_LEVELS.owner)

  /**
   * Check if current user can assign a given role
   * Can only assign roles at or below your own level
   */
  const canAssignRole = (targetRole) => {
    return currentLevel.value > ROLE_LEVELS[targetRole]
  }

  /**
   * Get roles that current user can assign to others
   */
  const assignableRoles = computed(() => {
    return ROLES.filter((role) => ROLE_LEVELS[role] < currentLevel.value)
  })

  /**
   * Promote or demote a user's role via edge function
   * @param {string} targetUserId - User ID to promote/demote
   * @param {string} newRole - New role to assign
   * @param {string} [bootstrapSecret] - Optional bootstrap secret for first owner
   * @returns {Promise<{success: boolean, message: string}>}
   */
  const promoteUser = async (targetUserId, newRole, bootstrapSecret = null) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const body = { targetUserId, newRole }
      if (bootstrapSecret) {
        body.bootstrapSecret = bootstrapSecret
      }

      const { data, error } = await supabase.functions.invoke('promote-role', {
        method: 'POST',
        body,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) {
        const msg = typeof error === 'object' ? error.message || JSON.stringify(error) : error
        throw new Error(msg)
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      return { success: true, message: data?.message || 'Role updated successfully' }
    } catch (err) {
      return { success: false, message: err.message || 'Failed to update role' }
    }
  }

  /**
   * Bootstrap the first owner account
   * Only works when no owners exist and BOOTSTRAP_SECRET is configured
   * @param {string} targetUserId - User ID to make owner
   * @param {string} secret - Bootstrap secret
   */
  const bootstrapOwner = async (targetUserId, secret) => {
    return promoteUser(targetUserId, 'owner', secret)
  }

  return {
    ROLES,
    ROLE_LEVELS,
    ROLE_LABELS,
    ROLE_COLORS,
    currentRole,
    currentLevel,
    canAccessAdmin,
    canManageUsers,
    canPromoteRoles,
    canManageShop,
    canManageEconomy,
    canBanUsers,
    canAssignOwnerRole,
    canAssignRole,
    assignableRoles,
    promoteUser,
    bootstrapOwner,
  }
}
