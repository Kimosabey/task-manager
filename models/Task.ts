import mongoose, { type InferSchemaType } from 'mongoose'

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true,
    },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dueDate: { type: Date },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
)

export type TaskDocument = InferSchemaType<typeof TaskSchema> & {
  _id: mongoose.Types.ObjectId
}

export const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema)
