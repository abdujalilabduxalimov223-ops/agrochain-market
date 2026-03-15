'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types';

export function useAuth(requiredRole?: UserRole | UserRole[]) {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (savedToken && savedUser) {
        try {
          setAuth(JSON.parse(savedUser), savedToken);
        } catch {
          logout();
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && requiredRole && user) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!roles.includes(user.role)) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, user, requiredRole]);

  return { user, token, isAuthenticated, logout };
}