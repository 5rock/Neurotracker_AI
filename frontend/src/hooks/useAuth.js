import { useAuthState } from './useAuthState';
import { useAuthActions } from './useAuthActions';

/** Combined auth hook — prefer useAuthState / useAuthActions in layout shells to reduce re-renders. */
export const useAuth = () => ({
  ...useAuthState(),
  ...useAuthActions(),
});
