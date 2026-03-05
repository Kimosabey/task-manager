'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

export function Navbar() {
  const { data } = useSession()

  return (
    <header className="sticky top-0 z-40 border-b border-ink-900/10 bg-sand-100/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight text-ink-900">
            Task Manager
          </Link>
          <nav className="hidden items-center gap-3 text-sm text-ink-700 md:flex">
            <Link href="/dashboard" className="hover:text-ink-900">
              Dashboard
            </Link>
            {process.env.NODE_ENV !== 'production' ? (
              <Link href="/docs" className="hover:text-ink-900">
                Docs
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right text-sm text-ink-700 sm:block">
            <div className="font-medium text-ink-900">{data?.user?.name ?? data?.user?.email}</div>
            <div className="text-xs">{data?.user?.role ?? 'member'}</div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="rounded-full bg-ink-900 px-3 py-1.5 text-xs font-medium text-sand-50 hover:bg-ink-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
