'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { ParallaxHero } from '@/components/ParallaxHero'

export function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

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
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-sand-500">Kanban Task Manager</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-sand-50 sm:text-5xl">
                Warm, editorial workflows.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-sand-100">
                Lenis owns scrolling. GSAP owns motion. Authentication stays frictionless.
              </p>
            </div>

            <div className="w-full max-w-md">
              <div className="rounded-2xl bg-sand-50 p-6 text-ink-900 shadow-card ring-1 ring-ink-900/10">
                <h2 className="text-base font-semibold tracking-tight">Log in</h2>
                <p className="mt-1 text-sm text-ink-700">Use your team email and password.</p>

                <form
                  className="mt-5 space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setError(null)
                    setLoading(true)

                    const res = await signIn('credentials', {
                      redirect: false,
                      email,
                      password,
                      callbackUrl,
                    })

                    setLoading(false)

                    if (!res || res.error) {
                      setError('Invalid email or password')
                      return
                    }

                    router.push(res.url ?? callbackUrl)
                  }}
                >
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
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </label>

                  {error ? <p className="text-sm text-ember-500">{error}</p> : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-xl bg-ink-900 py-2.5 text-sm font-medium text-sand-50 hover:bg-ink-700 disabled:opacity-60"
                  >
                    {loading ? 'Signing in…' : 'Sign in'}
                  </button>
                </form>

                <div className="mt-5 text-xs text-ink-700">
                  New here?{' '}
                  <Link href="/register" className="font-medium text-ember-500 hover:underline">
                    Create an account
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
