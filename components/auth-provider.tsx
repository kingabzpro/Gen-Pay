'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { checkAuthStatus } from '@/lib/appwrite/auth'
import type { Models } from 'appwrite'

interface AuthContextType {
  isAuthenticated: boolean
  user: Models.Session | null
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<Models.Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true)
        setError(null)
        
        const { isAuthenticated: authStatus, user: currentUser } = await checkAuthStatus()
        
        setIsAuthenticated(authStatus)
        setUser(currentUser || null)
      } catch (err: any) {
        console.error('Auth check error:', err)
        setError(err.message || 'Authentication check failed')
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
