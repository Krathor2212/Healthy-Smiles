export interface User {
  id: string;
  email: string;
  name: string;
  role: 'doctor' | 'admin';
  specialization?: string;
  phone?: string;
  avatar?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  avatar?: string;
  medicalHistory?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patient?: Patient;
  doctorId: string;
  appointmentTime: string;
  appointmentDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason?: string;
  notes?: string;
  specialty?: string;
  hospitalName?: string;
  hospitalAddress?: string;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  description?: string;
  dosage?: string;
  price: number;
  category?: string;
  manufacturer?: string;
  size?: string;
  inStock: boolean;
}

export interface PrescriptionItem {
  medicineId: string;
  medicine?: Medicine;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patient?: Patient;
  doctorId: string;
  items: PrescriptionItem[];
  diagnosis?: string;
  notes?: string;
  createdAt: string;
  status: 'pending' | 'filled' | 'cancelled';
}

export interface MedicalFile {
  id: string;
  name: string;
  uri: string;
  size: number;
  mimeType: string | null;
  createdAt: string;
  patientId: string;
  uploadedBy: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  senderName?: string;
}

export interface ChatRoom {
  id: string;
  patientId: string;
  patient?: Patient;
  doctorId: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
