'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { ParallaxHero } from '@/components/ParallaxHero'

type RegisterPayload = {
  name?: string
  email: string
  password: string
}

async function registerUser(payload: RegisterPayload) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const json = (await res.json().catch(() => null)) as null | { error?: string }

  if (!res.ok) {
    throw new Error(json?.error || 'Registration failed')
  }
}

export function RegisterClient() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const passwordMismatch = useMemo(() => {
    if (!password || !confirmPassword) return false
    return password !== confirmPassword
  }, [password, confirmPassword])

  return (
    <main className="min-h-screen bg-ink-900 text-sand-50">
      <ParallaxHero className="min-h-screen">
        <div
          data-parallax-speed="0.4"
          className="parallax-bg pointer-events-none absolute inset-0 opacity-40"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(196,168,130,0.30),transparent_55%),radial-gradient(circle_at_bottom,rgba(212,98,42,0.22),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,248,245,0.05)_1px,transparent_1px),linear-gradient(rgba(250,248,245,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4">
          <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
            <div className="max-w-lg">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-sand-500">Team onboarding</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-sand-50 sm:text-5xl">
                Create your account.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-sand-100">
                You’ll be signed in immediately after registration.
              </p>
            </div>

            <div className="w-full max-w-md">
              <div className="rounded-2xl bg-sand-50 p-6 text-ink-900 shadow-card ring-1 ring-ink-900/10">
                <h2 className="text-base font-semibold tracking-tight">Register</h2>
                <p className="mt-1 text-sm text-ink-700">Name is optional. Email and password are required.</p>

                <form
                  className="mt-5 space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setError(null)

                    const cleanEmail = email.toLowerCase().trim()

                    if (!cleanEmail) {
                      setError('Email is required')
                      return
                    }

                    if (!password) {
                      setError('Password is required')
                      return
                    }

                    if (passwordMismatch) {
                      setError('Passwords do not match')
                      return
                    }

                    setLoading(true)

                    try {
                      await registerUser({
                        name: name.trim() ? name.trim() : undefined,
                        email: cleanEmail,
                        password,
                      })

                      const res = await signIn('credentials', {
                        redirect: false,
                        email: cleanEmail,
                        password,
                        callbackUrl: '/dashboard',
                      })

                      if (!res || res.error) {
                        router.push('/login')
                        return
                      }

                      router.push(res.url ?? '/dashboard')
                    } catch (err: unknown) {
                      setError(err instanceof Error ? err.message : 'Registration failed')
                    } finally {
                      setLoading(false)
                    }
                  }}
                >
                  <label className="block">
                    <span className="text-xs font-medium text-ink-700">Name</span>
                    <input
                      className="mt-1 w-full rounded-xl bg-sand-100 px-3 py-2 text-sm ring-1 ring-ink-900/10 outline-none focus:ring-ember-500/40"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-ink-700">Email</span>
                    <input
                      className="mt-1 w-full rounded-xl bg-sand-100 px-3 py-2 text-sm ring-1 ring-ink-900/10 outline-none focus:ring-ember-500/40"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-ink-700">Password</span>
                    <input
                      className="mt-1 w-full rounded-xl bg-sand-100 px-3 py-2 text-sm ring-1 ring-ink-900/10 outline-none focus:ring-ember-500/40"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-ink-700">Confirm password</span>
                    <input
                      className="mt-1 w-full rounded-xl bg-sand-100 px-3 py-2 text-sm ring-1 ring-ink-900/10 outline-none focus:ring-ember-500/40"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    {passwordMismatch ? (
                      <p className="mt-1 text-xs text-ember-500">Passwords do not match.</p>
                    ) : null}
                  </label>

                  {error ? <p className="text-sm text-ember-500">{error}</p> : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-xl bg-ink-900 py-2.5 text-sm font-medium text-sand-50 hover:bg-ink-700 disabled:opacity-60"
                  >
                    {loading ? 'Creating…' : 'Create account'}
                  </button>
                </form>

                <div className="mt-5 text-xs text-ink-700">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-ember-500 hover:underline">
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ParallaxHero>
    </main>
  )
}
