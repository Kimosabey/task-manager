import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'

import { SwaggerUIClient } from '@/components/SwaggerUIClient'
import { authOptions } from '@/lib/auth'

export default async function DocsPage() {
  if (process.env.NODE_ENV === 'production') {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') notFound()
  }

  return (
    <main className="min-h-screen bg-sand-50 text-ink-900">
      <header className="mx-auto max-w-5xl px-4 pt-10 pb-6">
        <p className="text-sm text-ink-700">Task Manager</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">API Docs</h1>
        <p className="mt-2 text-sm text-ink-700">
          Swagger UI for local development and internal use.
        </p>
      </header>
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="rounded-2xl bg-sand-100 shadow-card ring-1 ring-ink-900/10">
          <SwaggerUIClient />
        </div>
      </section>
    </main>
  )
}
