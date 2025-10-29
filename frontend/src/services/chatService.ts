import axios from 'axios';
import { API_URL } from '../config';

const chatService = {
  // Get chat history between doctor and patient
  getChatHistory: async (patientDoctorId: string) => {
    const response = await axios.get(`${API_URL}/chat/${patientDoctorId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Send a new message
  sendMessage: async (patientDoctorId: string, content: string) => {
    const response = await axios.post(`${API_URL}/chat/${patientDoctorId}/messages`, 
      { content },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  },

  // Mark messages as read
  markMessagesAsRead: async (patientDoctorId: string) => {
    const response = await axios.put(`${API_URL}/chat/${patientDoctorId}/read`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Get all chats for a doctor
  getDoctorChats: async () => {
    const response = await axios.get(`${API_URL}/chat/doctor/chats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Get all chats for a patient
  getPatientChats: async () => {
    const response = await axios.get(`${API_URL}/chat/patient/chats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }
};

export default chatService;