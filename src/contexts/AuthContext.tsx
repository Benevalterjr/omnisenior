'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, ShiftType, UserPermissions } from '@/types/ilpi';
import { INITIAL_USERS } from '@/lib/mockData';
import { getUserPermissions, DEFAULT_ROLE_PERMISSIONS } from '@/lib/permissionsService';

interface AuthContextType {
  currentUser: UserProfile;
  role: UserRole;
  shift: ShiftType;
  availableUsers: UserProfile[];
  users: UserProfile[];
  permissions: UserPermissions;
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
  // Default to Diretora Camila (admin) or Enfermeiro Juliana
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0] as UserProfile);
  const [shift, setShift] = useState<ShiftType>('manha');

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

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const switchRole = (role: UserRole) => {
    const matchingUser = users.find(u => u.role === role);
    if (matchingUser) {
      setCurrentUser(matchingUser);
    } else {
      setCurrentUser(prev => ({ ...prev, role }));
    }
  };

  const addUser = (userData: Omit<UserProfile, 'id'>): UserProfile => {
    const newId = `user-${Date.now().toString(36)}`;
    const createdUser: UserProfile = {
      ...userData,
      id: newId,
      status: userData.status || 'active',
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [createdUser, ...prev]);
    return createdUser;
  };

  const updateUser = (userId: string, updates: Partial<UserProfile>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, ...updates };
        if (currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'inactive' : 'active';
        const updated: UserProfile = { ...u, status: nextStatus };
        if (currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser.id === userId) {
      // Switch back to admin
      const fallback = users.find(u => u.role === 'admin') || users[0];
      if (fallback) setCurrentUser(fallback);
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
