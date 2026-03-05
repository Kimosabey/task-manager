import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { connectToMongoDB } from '@/lib/mongodb'
import { User } from '@/models/User'

export const runtime = 'nodejs'

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List team members
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Array of users
 *       401:
 *         description: Unauthorized
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return new Response('Unauthorized', { status: 401 })

  await connectToMongoDB()

  const users = await User.find({}).sort({ createdAt: -1 }).select('name email role avatar createdAt')
  return Response.json(users)
}
