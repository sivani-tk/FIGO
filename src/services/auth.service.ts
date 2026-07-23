// ============================================================
// FIGO — Auth Service
// Mock JWT + Google OAuth ready
// ============================================================
import type { User } from '@/types'

const DEMO_USERS: User[] = [
  {
    id: '1',
    name: 'Figo Traveller',
    email: 'demo@figo.app',
    country: 'India',
    currency: 'INR',
    travelStyle: 'solo',
    language: 'en',
    createdAt: '2024-01-01T00:00:00Z',
  },
]

function generateToken(user: User): string {
  const payload = btoa(JSON.stringify({ id: user.id, email: user.email, exp: Date.now() + 86400000 }))
  return `figo.${payload}.mock`
}

export async function loginWithEmail(email: string, password: string): Promise<{ user: User; token: string }> {
  await delay(800)
  if (!email || !password) throw new Error('Invalid credentials')
  if (password.length < 6) throw new Error('Password must be at least 6 characters')

  const existing = DEMO_USERS.find((u) => u.email === email)
  const user: User = existing ?? {
    id: Math.random().toString(36).slice(2),
    name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    email,
    country: 'India',
    currency: 'INR',
    travelStyle: 'solo',
    language: 'en',
    createdAt: new Date().toISOString(),
  }

  return { user, token: generateToken(user) }
}

export async function signupWithEmail(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
  await delay(1000)
  if (!name || !email || !password) throw new Error('All fields are required')
  if (password.length < 6) throw new Error('Password must be at least 6 characters')

  const user: User = {
    id: Math.random().toString(36).slice(2),
    name,
    email,
    country: 'India',
    currency: 'INR',
    travelStyle: 'solo',
    language: 'en',
    createdAt: new Date().toISOString(),
  }

  return { user, token: generateToken(user) }
}

export async function loginWithGoogle(): Promise<{ user: User; token: string }> {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (GOOGLE_CLIENT_ID) {
    // In production: use Google Identity Services
    // window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: ... })
    console.log('Google OAuth: client_id configured, use GSI library for production')
  }

  // Mock Google login
  await delay(1200)
  const user: User = {
    id: 'google-' + Math.random().toString(36).slice(2),
    name: 'Traveller',
    email: 'traveller@gmail.com',
    country: 'India',
    currency: 'INR',
    travelStyle: 'solo',
    language: 'en',
    createdAt: new Date().toISOString(),
  }
  return { user, token: generateToken(user) }
}

export async function sendPasswordReset(email: string): Promise<void> {
  await delay(800)
  if (!email) throw new Error('Email is required')
  // In production: call your backend /auth/forgot-password endpoint
  console.log(`Password reset email sent to: ${email}`)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
