/**
 * useGuestRestriction.js
 *
 * Hook to gate premium features for guest users.
 * Shows the GuestUpgradeModal when a guest tries to access a restricted feature.
 *
 * Usage:
 *   const { checkRestriction } = useGuestRestriction();
 *   // In a click handler:
 *   if (checkRestriction('Export Reports')) return;
 *   // ... proceed with feature
 */

import { useState, useCallback } from 'react';
import { useAuthState } from './useAuthState';

export const useGuestRestriction = () => {
  const { user } = useAuthState();
  const [modalState, setModalState] = useState({ open: false, featureName: '' });

  /**
   * Returns true if access is BLOCKED (user is a guest), false if access is allowed.
   * When blocked, the upgrade modal is shown automatically.
   * @param {string} featureName - Human-readable name of the restricted feature
   */
  const checkRestriction = useCallback(
    (featureName = 'this feature') => {
      if (!user?.isGuest) return false; // Registered users pass through
      setModalState({ open: true, featureName });
      return true; // Blocked
    },
    [user]
  );

  const closeModal = useCallback(() => {
    setModalState({ open: false, featureName: '' });
  }, []);

  return {
    checkRestriction,
    isGuest: Boolean(user?.isGuest),
    modalOpen: modalState.open,
    featureName: modalState.featureName,
    closeModal,
  };
};
