import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

import { DashboardClient } from './ui'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  return <DashboardClient name={session?.user?.name ?? session?.user?.email ?? 'Team'} />
}
