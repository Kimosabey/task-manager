'use client'

import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useEffect, useMemo, useRef, useState } from 'react'

import useLenis from '@/lib/scroll/useLenis'
import type { TaskDTO, TaskPriority, TaskStatus, UserPublic } from '@/types'

import { TaskCard } from './TaskCard'
import { TaskModal } from './TaskModal'

gsap.registerPlugin(ScrollTrigger)

const columns: { key: TaskStatus; title: string }[] = [
  { key: 'todo', title: 'Todo' },
  { key: 'in-progress', title: 'In progress' },
  { key: 'done', title: 'Done' },
]

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed (${res.status})`)
  }

  return (await res.json()) as T
}

export function TaskBoard() {
  const lenis = useLenis()
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [tasks, setTasks] = useState<TaskDTO[]>([])
  const [users, setUsers] = useState<UserPublic[]>([])
  const [loading, setLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('')

  const [modalOpen, setModalOpen] = useState(false)
  const [activeTask, setActiveTask] = useState<TaskDTO | null>(null)

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, TaskDTO[]> = {
      todo: [],
      'in-progress': [],
      done: [],
    }

    tasks.forEach((t) => {
      map[t.status].push(t)
    })

    return map
  }, [tasks])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (statusFilter) params.set('status', statusFilter)
        if (priorityFilter) params.set('priority', priorityFilter)
        if (assigneeFilter) params.set('assignee', assigneeFilter)

        const [tasksData, usersData] = await Promise.all([
          fetchJSON<TaskDTO[]>(`/api/tasks?${params.toString()}`),
          fetchJSON<UserPublic[]>('/api/users'),
        ])

        if (cancelled) return

        setTasks(tasksData)
        setUsers(usersData)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [statusFilter, priorityFilter, assigneeFilter])

  useEffect(() => {
    if (!containerRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.kanban-col',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            invalidateOnRefresh: true,
          },
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [loading])

  async function submitTask(payload: {
    title: string
    description?: string
    status: TaskStatus
    priority: TaskPriority
    assignee?: string | null
    dueDate?: string | null
    tags?: string[]
  }) {
    if (activeTask) {
      const updated = await fetchJSON<TaskDTO>(`/api/tasks/${activeTask._id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
      return
    }

    const created = await fetchJSON<TaskDTO>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    setTasks((prev) => [created, ...prev])
  }

  async function moveTask(taskId: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status } : t)))

    try {
      const updated = await fetchJSON<TaskDTO>(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
    } catch {
      const fresh = await fetchJSON<TaskDTO[]>(`/api/tasks`)
      setTasks(fresh)
    }
  }

  function onDragEnd(result: DropResult) {
    lenis?.start()

    const { destination, source, draggableId } = result
    if (!destination) return

    const destStatus = destination.droppableId as TaskStatus
    const sourceStatus = source.droppableId as TaskStatus

    if (destStatus === sourceStatus && destination.index === source.index) return

    moveTask(draggableId, destStatus)
  }

  return (
    <div ref={containerRef} className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl bg-sand-100 p-4 ring-1 ring-ink-900/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
            className="rounded-full bg-sand-50 px-3 py-2 text-sm text-ink-900 ring-1 ring-ink-900/10"
          >
            <option value="">All statuses</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
            className="rounded-full bg-sand-50 px-3 py-2 text-sm text-ink-900 ring-1 ring-ink-900/10"
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="rounded-full bg-sand-50 px-3 py-2 text-sm text-ink-900 ring-1 ring-ink-900/10"
          >
            <option value="">All assignees</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name ?? u.email}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setStatusFilter('')
              setPriorityFilter('')
              setAssigneeFilter('')
            }}
            className="rounded-full bg-sand-50 px-3 py-2 text-sm text-ink-700 ring-1 ring-ink-900/10 hover:text-ink-900"
          >
            Reset
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveTask(null)
            setModalOpen(true)
          }}
          className="rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-sand-50 hover:bg-ink-700"
        >
          New task
        </button>
      </div>

      <DragDropContext onDragStart={() => lenis?.stop()} onDragEnd={onDragEnd}>
        <div className="grid gap-4 lg:grid-cols-3">
          {columns.map((col) => (
            <Droppable droppableId={col.key} key={col.key}>
              {(droppableProvided) => (
                <section
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                  className="kanban-col rounded-2xl bg-sand-100 p-3 ring-1 ring-ink-900/10"
                >
                  <header className="flex items-baseline justify-between gap-2 px-1">
                    <h3 className="text-sm font-semibold text-ink-900">{col.title}</h3>
                    <span className="text-xs text-ink-700">{grouped[col.key].length}</span>
                  </header>

                  <div className="mt-3 space-y-3">
                    {grouped[col.key].map((task, idx) => (
                      <Draggable draggableId={task._id} index={idx} key={task._id}>
                        {(draggableProvided) => (
                          <div
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                            {...draggableProvided.dragHandleProps}
                          >
                            <TaskCard
                              task={task}
                              onEdit={(t) => {
                                setActiveTask(t)
                                setModalOpen(true)
                              }}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {droppableProvided.placeholder}

                    {!loading && grouped[col.key].length === 0 ? (
                      <div className="rounded-xl bg-sand-50 px-3 py-4 text-sm text-ink-700 ring-1 ring-ink-900/10">
                        Nothing here yet.
                      </div>
                    ) : null}
                  </div>
                </section>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={activeTask}
        users={users}
        onSubmit={submitTask}
      />
    </div>
  )
}
