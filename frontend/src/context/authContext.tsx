import { createContext, useContext, type ReactNode, useState, useEffect } from 'react';
import { useCurrentUser, useLogin, useRegister, useLogout } from '../hooks/useAuth';

interface User {
  id: string
  socket: WebSocket
  username: string
  fName?: string
  lName?: string
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: ReturnType<typeof useLogin>['mutateAsync'];
  register: ReturnType<typeof useRegister>['mutateAsync'];
  logout: () => void;
  isLoggingIn: boolean;
  isRegistering: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: user, isLoading } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  
  // Initial user from localStorage (for immediate UI update)
  const [initialUser, setInitialUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const token = localStorage.getItem('token');

  // Update initial user when query data changes
  useEffect(() => {
    if (user) {
      setInitialUser(user);
    } else if (!token) {
      setInitialUser(null);
    }
  }, [user, token]);

  const logout = () => {
    logoutMutation.mutate();
    setInitialUser(null);
  };

  // Use query user if available, otherwise fall back to initial user
  const currentUser = user || initialUser;

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        token,
        isLoading,
        isAuthenticated: !!currentUser && !!token,
        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        logout,
        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

