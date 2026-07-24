// ============================================================
// FIGO — Auth Service (Google OAuth 2.0 via Google Identity Services)
// ============================================================
import type { User } from '@/types'

function generateToken(user: User): string {
  const payload = btoa(JSON.stringify({ id: user.id, email: user.email, exp: Date.now() + 86400000 }))
  return `figo.${payload}.auth`
}

export async function loginWithEmail(email: string, password: string): Promise<{ user: User; token: string }> {
  await delay(600)
  if (!email || !password) throw new Error('Invalid credentials')
  if (password.length < 6) throw new Error('Password must be at least 6 characters')

  const user: User = {
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
  await delay(800)
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

/**
 * Ensures Google Identity Services (GIS) library is loaded into window.google
 */
function ensureGsiLoaded(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      resolve()
      return
    }

    const existingScript = document.getElementById('google-gsi-script')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services SDK.')))
      return
    }

    const script = document.createElement('script')
    script.id = 'google-gsi-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity Services SDK.'))
    document.head.appendChild(script)
  })
}

/**
 * Initiates Google OAuth 2.0 flow via Google Identity Services (GIS).
 * Opens account picker, lets user select account, and retrieves name, email, and profile picture.
 */
export async function loginWithGoogle(): Promise<{ user: User; token: string }> {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google Client ID is not configured in environment (VITE_GOOGLE_CLIENT_ID).')
  }

  await ensureGsiLoaded()

  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services SDK is unavailable.')
  }

  return new Promise<{ user: User; token: string }>((resolve, reject) => {
    let isSettled = false

    const tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid profile email',
      callback: async (response) => {
        if (isSettled) return
        if (response.error) {
          isSettled = true
          if (response.error === 'access_denied') {
            reject(new Error('Google sign-in was cancelled.'))
          } else {
            reject(new Error(`Google Authentication Error: ${response.error_description || response.error}`))
          }
          return
        }

        if (!response.access_token) {
          isSettled = true
          reject(new Error('No access token received from Google.'))
          return
        }

        try {
          // Fetch Google UserInfo (Name, Email, Profile Picture / Avatar)
          const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              Authorization: `Bearer ${response.access_token}`,
            },
          })

          if (!userInfoRes.ok) {
            throw new Error(`Failed to fetch profile from Google (${userInfoRes.status})`)
          }

          const profile = await userInfoRes.json()

          const user: User = {
            id: `google-${profile.sub}`,
            name: profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || 'Google User',
            email: profile.email,
            avatar: profile.picture, // Google profile picture URL
            country: 'India',
            currency: 'INR',
            travelStyle: 'solo',
            language: 'en',
            createdAt: new Date().toISOString(),
          }

          isSettled = true
          resolve({ user, token: response.access_token || generateToken(user) })
        } catch (err: unknown) {
          if (!isSettled) {
            isSettled = true
            reject(err instanceof Error ? err : new Error('Failed to retrieve user profile from Google.'))
          }
        }
      },
      error_callback: (err: any) => {
        if (!isSettled) {
          isSettled = true
          reject(new Error(err?.message || 'Google account selector popup closed.'))
        }
      },
    })

    // Trigger Google Account Picker popup window
    tokenClient.requestAccessToken({ prompt: 'select_account' })
  })
}

export async function sendPasswordReset(email: string): Promise<void> {
  await delay(800)
  if (!email) throw new Error('Email is required')
  console.log(`Password reset email sent to: ${email}`)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
