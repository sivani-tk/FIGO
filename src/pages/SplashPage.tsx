import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Globe2 } from 'lucide-react'
import { FigoLogo } from '@/components/ui/FigoLogo'
import { useAuthStore } from '@/store/useAuthStore'
import { loginWithEmail, signupWithEmail, loginWithGoogle, sendPasswordReset } from '@/services/auth.service'

type AuthTab = 'login' | 'signup' | 'forgot'

// Schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
  rememberMe: z.boolean().optional(),
})
const signupSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
const forgotSchema = z.object({ email: z.string().email('Invalid email') })

type LoginForm = z.infer<typeof loginSchema>
type SignupForm = z.infer<typeof signupSchema>
type ForgotForm = z.infer<typeof forgotSchema>

// Animated mountain SVG
function MountainBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky gradient animated */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'linear-gradient(180deg, #0b111d 0%, #1a1a2e 30%, #2F4156 70%, #567C8D 100%)',
            'linear-gradient(180deg, #1a0a00 0%, #c0392b 20%, #f39c12 50%, #567C8D 80%, #C8D9E6 100%)',
            'linear-gradient(180deg, #2F4156 0%, #567C8D 40%, #C8D9E6 80%, #F5EFEB 100%)',
          ],
        }}
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
      />

      {/* Stars (only visible at night) */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 45}%`,
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 5 }}
        />
      ))}

      {/* Sun / Moon */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 60, height: 60, left: '65%' }}
        animate={{
          top: ['5%', '8%', '12%'],
          background: [
            'radial-gradient(circle, #fff 0%, #c0c0c0 100%)',
            'radial-gradient(circle, #FFD700 0%, #FF8C00 70%, #FF4500 100%)',
            'radial-gradient(circle, #FFF5CC 0%, #FFE066 100%)',
          ],
          boxShadow: [
            '0 0 20px 5px rgba(255,255,255,0.2)',
            '0 0 60px 20px rgba(255,150,0,0.5)',
            '0 0 40px 10px rgba(255,230,100,0.4)',
          ],
        }}
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
      />

      {/* Clouds */}
      {[
        { top: '15%', size: 80, delay: 0, duration: 35, opacity: 0.6 },
        { top: '10%', size: 120, delay: -12, duration: 50, opacity: 0.4 },
        { top: '20%', size: 60, delay: -25, duration: 28, opacity: 0.5 },
        { top: '8%', size: 100, delay: -8, duration: 42, opacity: 0.35 },
      ].map((cloud, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: cloud.top }}
          animate={{ x: ['-120px', '110vw'] }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            delay: cloud.delay,
            ease: 'linear',
          }}
        >
          <svg width={cloud.size} height={cloud.size * 0.5} viewBox="0 0 200 100" opacity={cloud.opacity}>
            <ellipse cx="100" cy="70" rx="80" ry="30" fill="white" />
            <ellipse cx="70" cy="60" rx="50" ry="35" fill="white" />
            <ellipse cx="130" cy="55" rx="45" ry="38" fill="white" />
            <ellipse cx="100" cy="50" rx="60" ry="40" fill="white" />
          </svg>
        </motion.div>
      ))}

      {/* Mountain layers - back */}
      <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 400" preserveAspectRatio="none" style={{ height: '60%' }}>
        <path d="M0,400 L0,250 L200,100 L400,220 L600,80 L800,200 L1000,60 L1200,180 L1440,90 L1440,400 Z"
          fill="rgba(47,65,86,0.6)" />
        <path d="M0,400 L0,300 L180,160 L360,260 L540,140 L720,250 L900,130 L1080,240 L1260,150 L1440,200 L1440,400 Z"
          fill="rgba(47,65,86,0.8)" />
        <path d="M0,400 L0,350 L160,230 L320,310 L480,200 L640,290 L800,190 L960,280 L1120,210 L1280,300 L1440,240 L1440,400 Z"
          fill="#2F4156" />
      </svg>

      {/* Snow caps */}
      <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 400" preserveAspectRatio="none" style={{ height: '60%', pointerEvents: 'none' }}>
        <path d="M580,84 L560,130 L620,130 Z" fill="rgba(245,239,235,0.9)" />
        <path d="M990,64 L975,100 L1010,100 Z" fill="rgba(245,239,235,0.8)" />
        <path d="M190,104 L175,140 L210,140 Z" fill="rgba(245,239,235,0.7)" />
      </svg>

      {/* Ground fog */}
      <div className="absolute bottom-0 left-0 right-0 h-24"
        style={{ background: 'linear-gradient(transparent, rgba(47,65,86,0.6))' }} />
    </div>
  )
}

export default function SplashPage() {
  const navigate = useNavigate()
  const { setUser, setRememberMe, rememberMe } = useAuthStore()
  const [tab, setTab] = useState<AuthTab>('login')
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const signupForm = useForm<SignupForm>({ resolver: zodResolver(signupSchema) })
  const forgotForm = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) })

  async function handleLogin(data: LoginForm) {
    setIsLoading(true); setError(null)
    try {
      const result = await loginWithEmail(data.email, data.password)
      setUser(result.user, result.token)
      setRememberMe(data.rememberMe ?? false)
      navigate('/home')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed')
    } finally { setIsLoading(false) }
  }

  async function handleSignup(data: SignupForm) {
    setIsLoading(true); setError(null)
    try {
      const result = await signupWithEmail(data.name, data.email, data.password)
      setUser(result.user, result.token)
      navigate('/home')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Signup failed')
    } finally { setIsLoading(false) }
  }

  async function handleGoogleLogin() {
    setIsLoading(true); setError(null)
    try {
      const result = await loginWithGoogle()
      setUser(result.user, result.token)
      navigate('/home')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Google login failed')
    } finally { setIsLoading(false) }
  }

  async function handleForgot(data: ForgotForm) {
    setIsLoading(true); setError(null)
    try {
      await sendPasswordReset(data.email)
      setSuccess('Reset link sent! Check your email inbox.')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send reset email')
    } finally { setIsLoading(false) }
  }

  function switchTab(t: AuthTab) {
    setTab(t); setError(null); setSuccess(null)
  }

  const inputClass = "w-full bg-white/5 border border-white/15 text-highlight placeholder-white/30 rounded-2xl px-4 py-3 pr-12 text-sm outline-none focus:border-secondary/70 focus:bg-white/10 transition-all duration-300"

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <MountainBackground />

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-primary-900/30" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo & hero */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FigoLogo size={56} showText={false} />
            </motion.div>
          </div>
          <motion.h1
            className="font-display font-black text-4xl md:text-5xl text-highlight tracking-tight mb-3"
            style={{ letterSpacing: '-0.04em' }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            FIGO
          </motion.h1>
          <h2 className="text-highlight/90 font-semibold text-xl mb-2">Every Journey Starts Here</h2>
          <p className="text-accent/70 text-sm leading-relaxed max-w-xs mx-auto">
            Let AI craft the perfect itinerary based on your travel style, budget and preferences.
          </p>
        </motion.div>

        {/* Auth card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(47, 65, 86, 0.75)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(200, 217, 230, 0.15)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Tabs (only for login/signup) */}
          {tab !== 'forgot' && (
            <div className="flex border-b border-white/10">
              {(['login', 'signup'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 py-4 text-sm font-semibold transition-all duration-300 ${
                    tab === t
                      ? 'text-highlight border-b-2 border-secondary'
                      : 'text-accent/50 hover:text-accent/80'
                  }`}
                >
                  {t === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          )}

          <div className="p-6">
            {/* Error / Success */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 px-4 py-3 rounded-2xl text-sm text-red-300 bg-red-500/15 border border-red-500/25"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 px-4 py-3 rounded-2xl text-sm text-green-300 bg-green-500/15 border border-green-500/25"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* LOGIN */}
              {tab === 'login' && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={loginForm.handleSubmit(handleLogin)}
                  className="space-y-4"
                >
                  {/* Google */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl text-sm font-semibold text-highlight transition-all duration-200 hover:bg-white/15 border border-white/15 bg-white/8 disabled:opacity-50"
                  >
                    <Globe2 size={18} className="text-blue-400" />
                    Continue with Google
                  </motion.button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-accent/40 text-xs">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/40 pointer-events-none" />
                    <input
                      {...loginForm.register('email')}
                      type="email"
                      placeholder="Email address"
                      className={inputClass + ' pl-10'}
                      id="login-email"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-red-400 text-xs mt-1 ml-1">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/40 pointer-events-none" />
                    <input
                      {...loginForm.register('password')}
                      type={showPass ? 'text' : 'password'}
                      placeholder="Password"
                      className={inputClass + ' pl-10'}
                      id="login-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-accent/40 hover:text-accent transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {loginForm.formState.errors.password && (
                      <p className="text-red-400 text-xs mt-1 ml-1">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  {/* Remember me + Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        {...loginForm.register('rememberMe')}
                        type="checkbox"
                        id="remember-me"
                        className="w-4 h-4 rounded border-white/20 bg-white/5 accent-secondary"
                      />
                      <span className="text-accent/70 text-xs">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => switchTab('forgot')}
                      className="text-secondary text-xs hover:text-accent transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign In <ArrowRight size={16} />
                      </span>
                    )}
                  </motion.button>
                </motion.form>
              )}

              {/* SIGNUP */}
              {tab === 'signup' && (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={signupForm.handleSubmit(handleSignup)}
                  className="space-y-4"
                >
                  {/* Google */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl text-sm font-semibold text-highlight transition-all duration-200 hover:bg-white/15 border border-white/15 bg-white/8 disabled:opacity-50"
                  >
                    <Globe2 size={18} className="text-blue-400" />
                    Continue with Google
                  </motion.button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-accent/40 text-xs">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/40 pointer-events-none" />
                    <input {...signupForm.register('name')} type="text" placeholder="Full name"
                      className={inputClass + ' pl-10'} id="signup-name" />
                    {signupForm.formState.errors.name && (
                      <p className="text-red-400 text-xs mt-1 ml-1">{signupForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/40 pointer-events-none" />
                    <input {...signupForm.register('email')} type="email" placeholder="Email address"
                      className={inputClass + ' pl-10'} id="signup-email" />
                    {signupForm.formState.errors.email && (
                      <p className="text-red-400 text-xs mt-1 ml-1">{signupForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/40 pointer-events-none" />
                    <input {...signupForm.register('password')} type={showPass ? 'text' : 'password'} placeholder="Password (min 6)"
                      className={inputClass + ' pl-10'} id="signup-password" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-accent/40 hover:text-accent">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {signupForm.formState.errors.password && (
                      <p className="text-red-400 text-xs mt-1 ml-1">{signupForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/40 pointer-events-none" />
                    <input {...signupForm.register('confirmPassword')} type={showConfirmPass ? 'text' : 'password'} placeholder="Confirm password"
                      className={inputClass + ' pl-10'} id="signup-confirm-password" />
                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-accent/40 hover:text-accent">
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {signupForm.formState.errors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1 ml-1">{signupForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    disabled={isLoading} className="btn-primary w-full py-3.5 disabled:opacity-60">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                        Creating account...
                      </span>
                    ) : <span className="flex items-center gap-2">Create Account <ArrowRight size={16} /></span>}
                  </motion.button>
                </motion.form>
              )}

              {/* FORGOT PASSWORD */}
              {tab === 'forgot' && (
                <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <button onClick={() => switchTab('login')} className="flex items-center gap-2 text-accent/60 text-sm mb-4 hover:text-accent transition-colors">
                    ← Back to Sign In
                  </button>
                  <h3 className="text-highlight font-semibold text-lg mb-1">Reset Password</h3>
                  <p className="text-accent/60 text-sm mb-4">Enter your email and we'll send a reset link.</p>

                  <form onSubmit={forgotForm.handleSubmit(handleForgot)} className="space-y-4">
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/40 pointer-events-none" />
                      <input {...forgotForm.register('email')} type="email" placeholder="Email address"
                        className={inputClass + ' pl-10'} id="forgot-email" />
                    </div>
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      disabled={isLoading} className="btn-primary w-full py-3.5 disabled:opacity-60">
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-accent/30 text-xs mt-6 font-display font-bold tracking-widest"
        >
          FIGO.
        </motion.p>
      </div>
    </div>
  )
}
