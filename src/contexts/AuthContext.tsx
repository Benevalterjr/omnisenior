'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, ShiftType } from '@/types/ilpi';
import { INITIAL_USERS } from '@/lib/mockData';

interface AuthContextType {
  currentUser: UserProfile;
  role: UserRole;
  shift: ShiftType;
  availableUsers: UserProfile[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  canManagePrescriptions: boolean;
  canCheckMedications: boolean;
  canManageResidents: boolean;
  canEditInventory: boolean;
  canViewAll: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default to Enfermeiro for best overview, but easily switchable to Cuidador, Médico, etc.
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[2] as UserProfile);
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
    const user = INITIAL_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user as UserProfile);
    }
  };

  const switchRole = (role: UserRole) => {
    const matchingUser = INITIAL_USERS.find(u => u.role === role);
    if (matchingUser) {
      setCurrentUser(matchingUser as UserProfile);
    } else {
      setCurrentUser(prev => ({ ...prev, role }));
    }
  };

  // Permission helpers aligned with firestore.rules
  const role = currentUser.role;
  const canManagePrescriptions = ['admin', 'medico', 'enfermeiro'].includes(role);
  const canCheckMedications = ['admin', 'medico', 'enfermeiro', 'cuidador'].includes(role);
  const canManageResidents = ['admin', 'enfermeiro', 'medico'].includes(role);
  const canEditInventory = ['admin', 'enfermeiro', 'cuidador'].includes(role);
  const canViewAll = true;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        shift,
        availableUsers: INITIAL_USERS as UserProfile[],
        switchUser,
        switchRole,
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
