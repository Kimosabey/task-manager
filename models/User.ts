import mongoose, { type InferSchemaType } from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    avatar: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId
}

export const User = mongoose.models.User || mongoose.model('User', UserSchema)
