import bcrypt from 'bcryptjs'

import { connectToMongoDB } from '@/lib/mongodb'
import { User } from '@/models/User'

export const runtime = 'nodejs'

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: User created
 *       409:
 *         description: Email already registered
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { name?: string; email?: string; password?: string }
    | null

  const email = body?.email?.toLowerCase().trim()
  const password = body?.password
  const name = body?.name?.trim()

  if (!email || !password) {
    return Response.json({ error: 'email and password are required' }, { status: 400 })
  }

  await connectToMongoDB()

  const existing = await User.findOne({ email })
  if (existing) {
    return Response.json({ error: 'Email already registered' }, { status: 409 })
  }

  const usersCount = await User.countDocuments()
  const role = usersCount === 0 ? 'admin' : 'member'

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await User.create({
    email,
    password: passwordHash,
    name,
    role,
  })

  return Response.json(
    {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    },
    { status: 201 }
  )
}
