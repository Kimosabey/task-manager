'use client'

import { useEffect, useMemo, useState } from 'react'

import type { TaskDTO, TaskPriority, TaskStatus, UserPublic } from '@/types'

type TaskModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (payload: {
    title: string
    description?: string
    status: TaskStatus
    priority: TaskPriority
    assignee?: string | null
    dueDate?: string | null
    tags?: string[]
  }) => Promise<void>
  task?: TaskDTO | null
  users?: UserPublic[]
}

const statuses: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
]

const priorities: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export function TaskModal({ open, onClose, onSubmit, task, users }: TaskModalProps) {
  const initial = useMemo(
    () => ({
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'todo',
      priority: task?.priority ?? 'medium',
      assignee:
        typeof task?.assignee === 'object' && task.assignee ? task.assignee._id : (task?.assignee ?? ''),
      dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
      tags: task?.tags?.join(', ') ?? '',
    }),
    [task]
  )

  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [status, setStatus] = useState<TaskStatus>(initial.status)
  const [priority, setPriority] = useState<TaskPriority>(initial.priority)
  const [assignee, setAssignee] = useState(initial.assignee)
  const [dueDate, setDueDate] = useState(initial.dueDate)
  const [tags, setTags] = useState(initial.tags)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTitle(initial.title)
    setDescription(initial.description)
    setStatus(initial.status)
    setPriority(initial.priority)
    setAssignee(initial.assignee)
    setDueDate(initial.dueDate)
    setTags(initial.tags)
    setError(null)
  }, [initial])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-ink-900/40"
        type="button"
        onClick={() => (saving ? null : onClose())}
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-sand-50 p-5 shadow-card ring-1 ring-ink-900/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-ink-900">
              {task ? 'Edit task' : 'New task'}
            </h3>
            <p className="mt-1 text-xs text-ink-700">Only transforms + opacity are animated elsewhere.</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-sand-100 px-3 py-1.5 text-xs text-ink-900 ring-1 ring-ink-900/10 hover:bg-sand-50"
            onClick={() => (saving ? null : onClose())}
          >
            Close
          </button>
        </div>

        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault()
            setSaving(true)
            setError(null)
            try {
              await onSubmit({
                title,
                description,
                status,
                priority,
                assignee: assignee ? assignee : null,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                tags: tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
              onClose()
            } catch (err: unknown) {
              setError(err instanceof Error ? err.message : 'Something went wrong')
            } finally {
              setSaving(false)
            }
          }}
        >
          <label className="block">
            <span className="text-xs font-medium text-ink-700">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl bg-sand-100 px-3 py-2 text-sm text-ink-900 ring-1 ring-ink-900/10 outline-none focus:ring-ember-500/40"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-ink-700">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full resize-none rounded-xl bg-sand-100 px-3 py-2 text-sm text-ink-900 ring-1 ring-ink-900/10 outline-none focus:ring-ember-500/40"
              rows={3}
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-ink-700">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="mt-1 w-full rounded-xl bg-sand-100 px-3 py-2 text-sm text-ink-900 ring-1 ring-ink-900/10 outline-none focus:ring-ember-500/40"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-ink-700">Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="mt-1 w-full rounded-xl bg-sand-100 px-3 py-2 text-sm text-ink-900 ring-1 ring-ink-900/10 outline-none focus:ring-ember-500/40"
              >
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-ink-700">Assignee</span>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="mt-1 w-full rounded-xl bg-sand-100 px-3 py-2 text-sm text-ink-900 ring-1 ring-ink-900/10 outline-none focus:ring-ember-500/40"
              >
                <option value="">Unassigned</option>
                {(users ?? []).map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name ?? u.email}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-ink-700">Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-xl bg-sand-100 px-3 py-2 text-sm text-ink-900 ring-1 ring-ink-900/10 outline-none focus:ring-ember-500/40"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-ink-700">Tags (comma separated)</span>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="mt-1 w-full rounded-xl bg-sand-100 px-3 py-2 text-sm text-ink-900 ring-1 ring-ink-900/10 outline-none focus:ring-ember-500/40"
            />
          </label>

          {error ? <p className="text-sm text-ember-500">{error}</p> : null}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-sand-50 hover:bg-ink-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
