/**
 * Dynamic Storage Helper for Chidon IQ User Experience isolation
 */

export function getActiveUserEmail(): string | null {
  const sessionStr = localStorage.getItem("chidon_sandbox_session");
  if (!sessionStr) return null;
  try {
    const session = JSON.parse(sessionStr);
    return session?.email || null;
  } catch {
    return null;
  }
}

export function getStorageKey(baseKey: string): string {
  const email = getActiveUserEmail();
  if (!email) return baseKey;
  const cleanEmail = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
  return `${baseKey}_${cleanEmail}`;
}

/**
 * Migration helper when registering or logging in to preserve previous guest progress
 */
export function migrateGuestToUser(email: string) {
  const cleanEmail = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
  
  const migrationKeys = [
    'guest_chidon_vault_drafts',
    'guest_ruled_pages',
    'guest_favorites',
    'chidon_shadowban_checklist'
  ];

  migrationKeys.forEach(key => {
    const genericData = localStorage.getItem(key);
    if (genericData) {
      const userSpecificKey = `${key}_${cleanEmail}`;
      // Only migrate if the user-specific key does not exist yet to prevent overwriting existing email data
      if (!localStorage.getItem(userSpecificKey)) {
        localStorage.setItem(userSpecificKey, genericData);
      }
    }
  });

  // Dynamic daily goals migration
  const today = new Date().toISOString().split('T')[0];
  const goalKey = `chidon_goal_${today}`;
  const genericGoal = localStorage.getItem(goalKey);
  if (genericGoal) {
    const userGoalKey = `${goalKey}_${cleanEmail}`;
    if (!localStorage.getItem(userGoalKey)) {
      localStorage.setItem(userGoalKey, genericGoal);
    }
  }
}
