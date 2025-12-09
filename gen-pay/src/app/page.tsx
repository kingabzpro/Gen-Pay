'use client'

import { useState } from 'react'
import { AuthForm } from '@/components/auth/AuthForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function Home() {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gen-Pay</h1>
          <p className="text-gray-600">Your next generation payment platform</p>
        </div>
        
        <AuthForm mode={mode} />
        
        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-sm"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'
            }
          </Button>
        </div>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Demo Mode</CardTitle>
            <CardDescription>
              Explore the app without authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                View Dashboard Demo
              </Button>
            </Link>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Note: Full functionality requires environment variables
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
