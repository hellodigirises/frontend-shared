import { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'SUPERADMIN' | 'TENANT_ADMIN' | 'SALES_MANAGER' | 'AGENT' | 'HR' | 'FINANCE' | 'PROCUREMENT';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantId?: string;
  tenantName?: string;
  avatar?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  modules: string[];            // e.g. ['CRM', 'BOOKINGS', 'FINANCE']
  accessToken: string | null;
  login: (user: AuthUser, token: string, modules: string[]) => void;
  logout: () => void;
  hasModule: (module: string) => boolean;
  hasRole: (...roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  modules: [],
  accessToken: null,
  login: () => {},
  logout: () => {},
  hasModule: () => false,
  hasRole: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [modules, setModules] = useState<string[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const login = (u: AuthUser, token: string, mods: string[]) => {
    setUser(u);
    setAccessToken(token);
    setModules(mods);
    // Persist token (use httpOnly cookie in production)
    sessionStorage.setItem('realesso_token', token);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setModules([]);
    sessionStorage.removeItem('realesso_token');
  };

  const hasModule = (module: string) =>
    user?.role === 'SUPERADMIN' || modules.includes(module);

  const hasRole = (...roles: Role[]) =>
    user ? roles.includes(user.role) : false;

  return (
    <AuthContext.Provider value={{ user, modules, accessToken, login, logout, hasModule, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
