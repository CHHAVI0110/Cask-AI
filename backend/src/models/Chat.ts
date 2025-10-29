import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  patientDoctorId: mongoose.Types.ObjectId;
  messages: {
    sender: mongoose.Types.ObjectId;
    content: string;
    timestamp: Date;
    read: boolean;
  }[];
  lastActivity: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    patientDoctorId: {
      type: Schema.Types.ObjectId,
      ref: 'PatientDoctor',
      required: true
    },
    messages: [
      {
        sender: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        content: {
          type: String,
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        read: {
          type: Boolean,
          default: false
        }
      }
    ],
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Create index for faster queries
ChatSchema.index({ patientDoctorId: 1 });

export default mongoose.model<IChat>('Chat', ChatSchema);