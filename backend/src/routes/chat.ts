














   import express from 'express';
import { 
  getChatHistory, 
  sendMessage, 
  markMessagesAsRead, 
  getDoctorChats,
  getPatientChats
} from '../controllers/chatController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get chat history between a doctor and patient
router.get('/:patientDoctorId', authenticate, getChatHistory);

// Send a new message
router.post('/:patientDoctorId/messages', authenticate, sendMessage);

// Mark messages as read
router.put('/:patientDoctorId/read', authenticate, markMessagesAsRead);

// Get all chats for a doctor
router.get('/doctor/chats', authenticate, getDoctorChats);

// Get all chats for a patient
router.get('/patient/chats', authenticate, getPatientChats);

export default router;