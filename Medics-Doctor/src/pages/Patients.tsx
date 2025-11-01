import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, Search, FileText, Calendar, Phone, Mail, Eye, MessageCircle } from 'lucide-react';
import type { Patient } from '../types';

const Patients: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const navigate = useNavigate();

  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ['patients', searchQuery],
    queryFn: async () => {
      const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      const response = await api.get(`/doctor/patients${params}`);
      return response.data.patients || [];
    },
  });

  const { data: patientFiles } = useQuery({
    queryKey: ['patientFiles', selectedPatient?.id],
    queryFn: async () => {
      if (!selectedPatient) return null;
      const response = await api.get(`/files/medical?patientId=${selectedPatient.id}`);
      return response.data.files || [];
    },
    enabled: !!selectedPatient,
  });

  const initiateChatMutation = useMutation({
    mutationFn: async (patientId: string) => {
      const response = await api.post('/doctor/chats/initiate', { patientId });
      return response.data;
    },
    onSuccess: (data) => {
      // Navigate to chats page with the chat selected
      navigate(`/chats?chatId=${data.chat.id}`);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to start chat');
    },
  });

  const handleStartChat = () => {
    if (selectedPatient) {
      initiateChatMutation.mutate(selectedPatient.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        <p className="text-gray-600 mt-1">View and manage patient records</p>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Patients Grid/List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patients List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading patients...</p>
            </div>
          ) : patients && patients.length > 0 ? (
            patients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className={`card cursor-pointer transition-all ${
                  selectedPatient?.id === patient.id
                    ? 'ring-2 ring-primary-500 shadow-lg'
                    : 'hover:shadow-lg'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-8 h-8 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {patient.name}
                    </h3>
                    <div className="mt-1 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {patient.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {patient.phone}
                      </div>
                    </div>
                  </div>
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No patients found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search query</p>
            </div>
          )}
        </div>

        {/* Patient Details Sidebar */}
        <div className="lg:col-span-1">
          {selectedPatient ? (
            <div className="card sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Patient Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900 font-medium">{selectedPatient.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{selectedPatient.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{selectedPatient.phone}</p>
                </div>
                
                {selectedPatient.dateOfBirth && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-gray-900">{selectedPatient.dateOfBirth}</p>
                  </div>
                )}
                
                {selectedPatient.gender && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-gray-900 capitalize">{selectedPatient.gender}</p>
                  </div>
                )}
                
                {selectedPatient.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900">{selectedPatient.address}</p>
                  </div>
                )}

                {selectedPatient.medicalHistory && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Medical History</label>
                    <p className="text-gray-900 text-sm">{selectedPatient.medicalHistory}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t space-y-3">
                <h4 className="font-semibold text-gray-900">Medical Files</h4>
                {patientFiles && patientFiles.length > 0 ? (
                  <div className="space-y-2">
                    {patientFiles.map((file: any) => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-600 mr-2" />
                          <span className="text-sm text-gray-900">{file.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No files uploaded</p>
                )}
              </div>

              <div className="mt-6 space-y-2">
                <button 
                  onClick={handleStartChat}
                  disabled={initiateChatMutation.isPending}
                  className="w-full btn-primary"
                >
                  <MessageCircle className="w-4 h-4 mr-2 inline" />
                  {initiateChatMutation.isPending ? 'Starting Chat...' : 'Start Chat'}
                </button>
                <button className="w-full btn-secondary">
                  <Calendar className="w-4 h-4 mr-2 inline" />
                  View Appointments
                </button>
                <button className="w-full btn-secondary">
                  <FileText className="w-4 h-4 mr-2 inline" />
                  Create Prescription
                </button>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Select a patient to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Patients;
