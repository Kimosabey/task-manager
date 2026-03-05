import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { connectToMongoDB } from '@/lib/mongodb'
import { Task } from '@/models/Task'

export const runtime = 'nodejs'

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a single task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { id } = await params

  await connectToMongoDB()

  const task = await Task.findById(id)
    .populate('assignee', 'name email role avatar')
    .populate('createdBy', 'name email role avatar')

  if (!task) return new Response('Not found', { status: 404 })

  return Response.json(task)
}

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [todo, in-progress, done] }
 *               priority: { type: string, enum: [low, medium, high] }
 *               assignee: { type: string, nullable: true }
 *               dueDate: { type: string, format: date-time, nullable: true }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200:
 *         description: Updated task
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { id } = await params

  const body = (await req.json().catch(() => null)) as
    | {
        title?: string
        description?: string
        status?: 'todo' | 'in-progress' | 'done'
        priority?: 'low' | 'medium' | 'high'
        assignee?: string | null
        dueDate?: string | null
        tags?: string[]
      }
    | null

  if (!body) return Response.json({ error: 'Invalid JSON body' }, { status: 400 })

  const update: Partial<{
    title: string
    description: string
    status: 'todo' | 'in-progress' | 'done'
    priority: 'low' | 'medium' | 'high'
    assignee?: string
    dueDate?: Date
    tags: string[]
  }> = {}

  if (typeof body.title === 'string') update.title = body.title.trim()
  if (typeof body.description === 'string') update.description = body.description
  if (body.status) update.status = body.status
  if (body.priority) update.priority = body.priority
  if (body.assignee !== undefined) update.assignee = body.assignee || undefined
  if (body.dueDate !== undefined) update.dueDate = body.dueDate ? new Date(body.dueDate) : undefined
  if (Array.isArray(body.tags)) update.tags = body.tags

  await connectToMongoDB()

  const task = await Task.findByIdAndUpdate(id, update, { new: true })
    .populate('assignee', 'name email role avatar')
    .populate('createdBy', 'name email role avatar')

  if (!task) return new Response('Not found', { status: 404 })

  return Response.json(task)
}

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete task (admin only)
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response('Unauthorized', { status: 401 })
  if (session.user.role !== 'admin') return new Response('Forbidden', { status: 403 })

  const { id } = await params

  await connectToMongoDB()

  await Task.findByIdAndDelete(id)
  return new Response(null, { status: 204 })
}
