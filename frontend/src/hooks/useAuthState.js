import { useContext } from 'react';
import { AuthContext } from '../context/auth-context';

export const useAuthState = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthState must be used within AuthProvider');
  return context;
};
