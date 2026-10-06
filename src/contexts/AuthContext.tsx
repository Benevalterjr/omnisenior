'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, ShiftType, UserPermissions } from '@/types/ilpi';
import { INITIAL_USERS } from '@/lib/mockData';
import { getUserPermissions, DEFAULT_ROLE_PERMISSIONS } from '@/lib/permissionsService';

const USERS_STORAGE_KEY = 'omnisenior_users_v1';
const SESSION_STORAGE_KEY = 'omnisenior_session_v1';

interface AuthContextType {
  currentUser: UserProfile;
  role: UserRole;
  shift: ShiftType;
  availableUsers: UserProfile[];
  users: UserProfile[];
  permissions: UserPermissions;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  resetUserPassword: (userId: string, newPassword: string) => void;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  addUser: (userData: Omit<UserProfile, 'id'>) => UserProfile;
  updateUser: (userId: string, updates: Partial<UserProfile>) => void;
  toggleUserStatus: (userId: string) => void;
  deleteUser: (userId: string) => void;
  canAccessAdmin: boolean;
  canManagePrescriptions: boolean;
  canCheckMedications: boolean;
  canManageResidents: boolean;
  canEditInventory: boolean;
  canViewAll: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS as UserProfile[]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0] as UserProfile);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [shift, setShift] = useState<ShiftType>('manha');

  // Initialize from LocalStorage or INITIAL_USERS on client mount
  useEffect(() => {
    let loadedUsers = INITIAL_USERS as UserProfile[];

    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedUsers = parsed;
        }
      } else {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      }
    } catch (e) {
      console.warn('Erro ao carregar usuários locais:', e);
    }
    setUsers(loadedUsers);

    // Check active session
    try {
      const sessionUserId = localStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionUserId) {
        const sessionUser = loadedUsers.find(u => u.id === sessionUserId);
        if (sessionUser && sessionUser.status !== 'inactive') {
          setCurrentUser(sessionUser);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar sessão:', e);
    }

    setIsAuthReady(true);
  }, []);

  // Save users whenever they change
  const persistUsers = (updatedUsers: UserProfile[]) => {
    setUsers(updatedUsers);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    } catch (e) {
      console.warn('Erro ao salvar usuários locais:', e);
    }
  };

  // Determine current shift based on local hour
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 13) {
      setShift('manha');
    } else if (hour >= 13 && hour < 19) {
      setShift('tarde');
    } else {
      setShift('noite');
    }
  }, []);

  // Login handler
  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const normalizedEmail = email.trim().toLowerCase();
    const foundUser = users.find(u => u.email.trim().toLowerCase() === normalizedEmail);

    if (!foundUser) {
      return { 
        success: false, 
        error: 'Usuário não encontrado. Solicite à Diretoria/Admin Master a criação da sua conta.' 
      };
    }

    if (foundUser.status === 'inactive') {
      return { 
        success: false, 
        error: 'Esta conta está inativa/bloqueada. Contate a Diretoria da ILPI para liberação.' 
      };
    }

    const expectedPassword = foundUser.password || 'admin123';
    if (foundUser.password && foundUser.password !== password.trim()) {
      return { 
        success: false, 
        error: 'Senha incorreta. Verifique suas credenciais com o Admin Master.' 
      };
    }

    setCurrentUser(foundUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, foundUser.id);
    } catch (e) {
      console.warn('Erro ao salvar sessão:', e);
    }

    return { success: true };
  };

  // Logout handler
  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.warn('Erro ao remover sessão:', e);
    }
  };

  // Reset user password by Admin Master
  const resetUserPassword = (userId: string, newPassword: string) => {
    updateUser(userId, { password: newPassword });
  };

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, user.id);
      } catch (e) {
        console.warn('Erro ao salvar sessão:', e);
      }
    }
  };

  const switchRole = (role: UserRole) => {
    const matchingUser = users.find(u => u.role === role);
    if (matchingUser) {
      setCurrentUser(matchingUser);
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, matchingUser.id);
      } catch (e) {
        console.warn('Erro ao salvar sessão:', e);
      }
    } else {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
    }
  };

  const addUser = (userData: Omit<UserProfile, 'id'>): UserProfile => {
    const newId = `user-${Date.now().toString(36)}`;
    const createdUser: UserProfile = {
      ...userData,
      id: newId,
      status: userData.status || 'active',
      password: userData.password || 'Senior#2026!',
      createdAt: new Date().toISOString()
    };
    const updatedUsers = [createdUser, ...users];
    persistUsers(updatedUsers);
    return createdUser;
  };

  const updateUser = (userId: string, updates: Partial<UserProfile>) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const updated = { ...u, ...updates };
        if (currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    });
    persistUsers(updatedUsers);
  };

  const toggleUserStatus = (userId: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'inactive' : 'active';
        const updated: UserProfile = { ...u, status: nextStatus };
        if (currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    });
    persistUsers(updatedUsers);
  };

  const deleteUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    persistUsers(updatedUsers);
    if (currentUser.id === userId) {
      const fallback = updatedUsers.find(u => u.role === 'admin') || updatedUsers[0] || null;
      if (fallback) {
        setCurrentUser(fallback);
      } else {
        setIsAuthenticated(false);
      }
    }
  };

  // Granular permissions calculation
  const permissions = getUserPermissions(currentUser);
  const role = currentUser.role;

  const canAccessAdmin = role === 'admin';
  const canManagePrescriptions = permissions.canPrescribe || ['admin', 'medico', 'enfermeiro'].includes(role);
  const canCheckMedications = permissions.canAdministerMedication || ['admin', 'medico', 'enfermeiro', 'cuidador'].includes(role);
  const canManageResidents = permissions.canManageResidents || ['admin', 'enfermeiro', 'medico'].includes(role);
  const canEditInventory = permissions.canManageInventory || ['admin', 'enfermeiro', 'cuidador'].includes(role);
  const canViewAll = true;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        shift,
        availableUsers: users,
        users,
        permissions,
        isAuthenticated,
        isAuthReady,
        login,
        logout,
        resetUserPassword,
        switchUser,
        switchRole,
        addUser,
        updateUser,
        toggleUserStatus,
        deleteUser,
        canAccessAdmin,
        canManagePrescriptions,
        canCheckMedications,
        canManageResidents,
        canEditInventory,
        canViewAll
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
