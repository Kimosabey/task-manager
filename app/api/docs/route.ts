import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { getSwaggerSpec } from '@/lib/swagger'

export const runtime = 'nodejs'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return new Response('Not found', { status: 404 })
    }
  }

  return Response.json(getSwaggerSpec())
}
