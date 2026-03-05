import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { connectToMongoDB } from '@/lib/mongodb'
import { Task } from '@/models/Task'

export const runtime = 'nodejs'

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [todo, in-progress, done] }
 *       - in: query
 *         name: assignee
 *         schema: { type: string }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high] }
 *     responses:
 *       200:
 *         description: Array of task objects
 *       401:
 *         description: Unauthorized
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response('Unauthorized', { status: 401 })

  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const assignee = url.searchParams.get('assignee')
  const priority = url.searchParams.get('priority')

  const filter: { status?: string; assignee?: string; priority?: string } = {}

  if (status) filter.status = status
  if (assignee) filter.assignee = assignee
  if (priority) filter.priority = priority

  await connectToMongoDB()

  const tasks = await Task.find(filter)
    .sort({ updatedAt: -1 })
    .populate('assignee', 'name email role avatar')
    .populate('createdBy', 'name email role avatar')

  return Response.json(tasks)
}

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [todo, in-progress, done] }
 *               priority: { type: string, enum: [low, medium, high] }
 *               assignee: { type: string }
 *               dueDate: { type: string, format: date-time }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       201:
 *         description: Task created
 *       401:
 *         description: Unauthorized
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response('Unauthorized', { status: 401 })

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

  const title = body?.title?.trim()
  if (!title) return Response.json({ error: 'title is required' }, { status: 400 })

  await connectToMongoDB()

  const task = await Task.create({
    title,
    description: body?.description ?? '',
    status: body?.status,
    priority: body?.priority,
    assignee: body?.assignee || undefined,
    dueDate: body?.dueDate ? new Date(body.dueDate) : undefined,
    tags: body?.tags ?? [],
    createdBy: session.user.id,
  })

  const populated = await Task.findById(task._id)
    .populate('assignee', 'name email role avatar')
    .populate('createdBy', 'name email role avatar')

  return Response.json(populated, { status: 201 })
}
