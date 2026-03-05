'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

import type { TaskDTO } from '@/types'

const priorityStyles: Record<string, string> = {
  low: 'bg-sand-100 text-ink-700 ring-1 ring-ink-900/10',
  medium: 'bg-sand-100 text-ink-700 ring-1 ring-ink-900/10',
  high: 'bg-ember-500/15 text-ink-900 ring-1 ring-ember-500/30',
}

export function TaskCard({ task, onEdit }: { task: TaskDTO; onEdit: (task: TaskDTO) => void }) {
  const ref = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const enter = () => {
      el.style.willChange = 'transform'
      gsap.to(el, { y: -4, duration: 0.18, ease: 'power2.out' })
    }

    const leave = () => {
      gsap.to(el, {
        y: 0,
        duration: 0.18,
        ease: 'power2.out',
        onComplete: () => {
          el.style.willChange = 'auto'
        },
      })
    }

    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)

    return () => {
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
    }
  }, [])

  return (
    <button
      ref={(node) => {
        ref.current = node
      }}
      type="button"
      onClick={() => onEdit(task)}
      className="task-card reveal-item group w-full rounded-2xl bg-sand-50 px-3 py-3 text-left shadow-card ring-1 ring-ink-900/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold leading-snug text-ink-900">{task.title}</h4>
          {task.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-700">{task.description}</p>
          ) : null}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${priorityStyles[task.priority] ?? priorityStyles.medium}`}
        >
          {task.priority}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-ink-700">
        <span className="truncate">
          {typeof task.assignee === 'object' && task.assignee ? task.assignee.name ?? task.assignee.email : 'Unassigned'}
        </span>
        {task.dueDate ? (
          <span className="rounded-full bg-sand-100 px-2 py-1 text-[11px]">{new Date(task.dueDate).toLocaleDateString()}</span>
        ) : null}
      </div>
    </button>
  )
}
