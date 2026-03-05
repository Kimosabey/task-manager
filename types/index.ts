export type Role = 'admin' | 'member'

export type UserPublic = {
  _id: string
  name?: string
  email: string
  role: Role
  avatar?: string
  createdAt?: string
}

export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export type TaskDTO = {
  _id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignee?: UserPublic | string | null
  createdBy: UserPublic | string
  dueDate?: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}
