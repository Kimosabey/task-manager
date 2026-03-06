import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/lib/auth'

import { RegisterClient } from './ui'

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return <RegisterClient />
}
