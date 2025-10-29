import { Request, Response } from 'express';
import Chat from '../models/Chat';
import PatientDoctor from '../models/PatientDoctor';
import User from '../models/User';
import Notification from '../models/Notification';
import mongoose from 'mongoose';

// Get chat history between a doctor and patient
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { patientDoctorId } = req.params;
    
    // Validate patientDoctorId
    if (!mongoose.Types.ObjectId.isValid(patientDoctorId)) {
      return res.status(400).json({ message: 'Invalid patient-doctor relationship ID' });
    }
    
    // Find the chat
    const chat = await Chat.findOne({ patientDoctorId })
      .populate({
        path: 'messages.sender',
        select: 'firstName lastName role profileImage'
      });
    
    if (!chat) {
      // Create a new chat if it doesn't exist
      const newChat = new Chat({ patientDoctorId, messages: [] });
      await newChat.save();
      return res.status(200).json({ chat: newChat, messages: [] });
    }
    
    return res.status(200).json({ chat, messages: chat.messages });
  } catch (error) {
    console.error('Error getting chat history:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Send a new message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { patientDoctorId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;
    
    // Validate inputs
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }
    
    // Find or create chat
    let chat = await Chat.findOne({ patientDoctorId });
    
    if (!chat) {
      // Verify the patient-doctor relationship exists
      const relationship = await PatientDoctor.findById(patientDoctorId);
      if (!relationship) {
        return res.status(404).json({ message: 'Patient-doctor relationship not found' });
      }
      
      chat = new Chat({ patientDoctorId, messages: [] });
    }
    
    // Add new message
    const newMessage = {
      sender: new mongoose.Types.ObjectId(senderId),
      content,
      timestamp: new Date(),
      read: false
    };
    
    chat.messages.push(newMessage);
    chat.lastActivity = new Date();
    await chat.save();
    
    // Get relationship to determine recipient
    const relationship = await PatientDoctor.findById(patientDoctorId);
    if (!relationship) {
      return res.status(404).json({ message: 'Patient-doctor relationship not found' });
    }
    
    // Determine recipient based on sender
    const recipientId = senderId.toString() === relationship.patientId.toString() 
      ? relationship.doctorId 
      : relationship.patientId;
    
    // Create notification for recipient
    const sender = await User.findById(senderId).select('firstName lastName');
    
    await Notification.create({
      userId: recipientId,
      type: 'message',
      title: 'New Message',
      content: `${sender.firstName} ${sender.lastName} sent you a message`,
      data: {
        patientDoctorId,
        messageId: chat.messages[chat.messages.length - 1]._id
      },
      read: false
    });
    
    // Return the newly created message with sender info
    const populatedMessage = await Chat.findOne(
      { _id: chat._id, 'messages._id': newMessage._id },
      { 'messages.$': 1 }
    ).populate({
      path: 'messages.sender',
      select: 'firstName lastName role profileImage'
    });
    
    return res.status(201).json({ 
      message: populatedMessage.messages[0],
      chatId: chat._id
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req: Request, res: Response) => {
  try {
    const { patientDoctorId } = req.params;
    const userId = req.user.id;
    
    // Find the chat
    const chat = await Chat.findOne({ patientDoctorId });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Mark all messages from the other user as read
    let updated = false;
    chat.messages.forEach(message => {
      if (message.sender.toString() !== userId && !message.read) {
        message.read = true;
        updated = true;
      }
    });
    
    if (updated) {
      await chat.save();
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all chats for a doctor (with patient info)
export const getDoctorChats = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user.id;
    
    // Find all patient-doctor relationships for this doctor
    const relationships = await PatientDoctor.find({ 
      doctorId, 
      status: 'active' 
    }).populate({
      path: 'patientId',
      select: 'firstName lastName profileImage'
    });
    
    // Get chats for each relationship
    const chatPromises = relationships.map(async (rel) => {
      const chat = await Chat.findOne({ patientDoctorId: rel._id })
        .sort({ lastActivity: -1 })
        .limit(1);
      
      // Count unread messages
      const unreadCount = chat ? 
        chat.messages.filter(m => 
          m.sender.toString() === rel.patientId._id.toString() && !m.read
        ).length : 0;
      
      return {
        patientDoctorId: rel._id,
        patient: rel.patientId,
        lastMessage: chat && chat.messages.length > 0 ? 
          chat.messages[chat.messages.length - 1] : null,
        lastActivity: chat ? chat.lastActivity : rel.createdAt,
        unreadCount
      };
    });
    
    const chats = await Promise.all(chatPromises);
    
    // Sort by last activity
    chats.sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
    
    return res.status(200).json({ chats });
  } catch (error) {
    console.error('Error getting doctor chats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all chats for a patient (with doctor info)
export const getPatientChats = async (req: Request, res: Response) => {
  try {
    const patientId = req.user.id;
    
    // Find all patient-doctor relationships for this patient
    const relationships = await PatientDoctor.find({ 
      patientId, 
      status: 'active' 
    }).populate({
      path: 'doctorId',
      select: 'firstName lastName profileImage'
    });
    
    // Get chats for each relationship
    const chatPromises = relationships.map(async (rel) => {
      const chat = await Chat.findOne({ patientDoctorId: rel._id })
        .sort({ lastActivity: -1 })
        .limit(1);
      
      // Count unread messages
      const unreadCount = chat ? 
        chat.messages.filter(m => 
          m.sender.toString() === rel.doctorId._id.toString() && !m.read
        ).length : 0;
      
      return {
        patientDoctorId: rel._id,
        doctor: rel.doctorId,
        lastMessage: chat && chat.messages.length > 0 ? 
          chat.messages[chat.messages.length - 1] : null,
        lastActivity: chat ? chat.lastActivity : rel.createdAt,
        unreadCount
      };
    });
    
    const chats = await Promise.all(chatPromises);
    
    // Sort by last activity
    chats.sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
    
    return res.status(200).json({ chats });
  } catch (error) {
    console.error('Error getting patient chats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};