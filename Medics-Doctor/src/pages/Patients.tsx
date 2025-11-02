import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, Search, FileText, Calendar, Phone, Mail, Eye, MessageCircle, Download, ExternalLink, RefreshCw } from 'lucide-react';
import type { Patient } from '../types';

const Patients: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ['patients', searchQuery],
    queryFn: async () => {
      const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      const response = await api.get(`/doctor/patients${params}`);
      return response.data.patients || [];
    },
  });

  // Fetch authorizations to check which patients have granted access
  const { data: authorizations } = useQuery({
    queryKey: ['authorizations'],
    queryFn: async () => {
      const response = await api.get('/authorizations');
      // Extract authorizations array from response
      const authList = response.data?.authorizations || response.data || [];
      // Convert array to map for quick lookup by patient_id
      const authMap: Record<string, any> = {};
      authList.forEach((auth: any) => {
        authMap[auth.patient_id] = auth;
      });
      return authMap;
    },
  });

  const { data: patientFiles } = useQuery({
    queryKey: ['patientFiles', selectedPatient?.id],
    queryFn: async () => {
      if (!selectedPatient) return null;
      const response = await api.get(`/files/medical/patient/${selectedPatient.id}`);
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
      navigate(`/chats?chatId=${data.chatId}`);
    },
    onError: (error: any) => {
      console.error('Start chat error:', error);
      alert(error.response?.data?.error || 'Failed to start chat');
    },
  });

  const requestAccessMutation = useMutation({
    mutationFn: async (patientId: string) => {
      const response = await api.post('/access/request', { 
        patientId,
        message: 'Requesting access to view your medical files for treatment purposes'
      });
      return response.data;
    },
    onSuccess: () => {
      alert('Access request sent successfully! The patient will be notified.');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to send access request');
    },
  });

  const handleStartChat = () => {
    if (selectedPatient) {
      initiateChatMutation.mutate(selectedPatient.id);
    }
  };

  const handleRequestAccess = () => {
    if (selectedPatient) {
      if (confirm('Send an access request to this patient to view their medical files?')) {
        requestAccessMutation.mutate(selectedPatient.id);
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
        queryClient.invalidateQueries({ queryKey: ['authorizations'] }),
        queryClient.invalidateQueries({ queryKey: ['patientFiles'] })
      ]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleDownloadFile = async (fileId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to download files');
        return;
      }

      // Fetch the file with proper authentication
      const response = await api.get(`/files/medical/${fileId}/download`, {
        responseType: 'blob', // Important for file downloads
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `file-${fileId}`;
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading file:', error);
      alert(error.response?.data?.error || 'Failed to download file');
    }
  };

  const handleViewFile = async (fileId: string, filename: string) => {
    // Prevent multiple clicks
    if (loadingFileId) return;
    
    try {
      setLoadingFileId(fileId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to view files');
        setLoadingFileId(null);
        return;
      }

      console.log('Fetching file:', fileId);

      // Fetch the file with proper authentication
      const response = await api.get(`/files/medical/${fileId}/download`, {
        responseType: 'blob',
      });

      const contentType = response.headers['content-type'];
      
      // response.data is already a Blob when using responseType: 'blob'
      const blob = response.data instanceof Blob 
        ? response.data 
        : new Blob([response.data], { type: contentType });
      
      const url = window.URL.createObjectURL(blob);
      
      // Set preview state to show modal
      setPreviewFile({ url, name: filename, type: contentType });
    } catch (error: any) {
      console.error('Error viewing file:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to view file';
      if (error.response?.status === 403) {
        errorMessage = '🔒 Access Denied\n\nYou are not authorized to view this patient\'s medical files.\n\nThe patient needs to grant you access first through their mobile app in the "Authorized Doctors" section.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoadingFileId(null);
    }
  };

  const closePreview = () => {
    if (previewFile) {
      window.URL.revokeObjectURL(previewFile.url);
      setPreviewFile(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">View and manage patient records</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-all ${
            isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Refresh data"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-gray-700 font-medium">Refresh</span>
        </button>
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
            patients.map((patient) => {
              const auth = authorizations?.[patient.id];
              const isAuthorized = auth && auth.is_active && (!auth.expires_at || new Date(auth.expires_at) > new Date());
              const isExpired = auth && auth.expires_at && new Date(auth.expires_at) <= new Date();
              
              return (
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
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {patient.name}
                      </h3>
                      {isAuthorized ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Authorized
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          🔒 No Access
                        </span>
                      )}
                    </div>
                    <div className="mt-1 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {patient.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {patient.phone}
                      </div>
                      {isAuthorized && auth.expires_at && (
                        <div className="text-xs text-green-600 mt-1">
                          Expires: {new Date(auth.expires_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              );
            })
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
                {/* Authorization Status */}
                {(() => {
                  const auth = authorizations?.[selectedPatient.id];
                  const isAuthorized = auth && auth.is_active && (!auth.expires_at || new Date(auth.expires_at) > new Date());
                  const isExpired = auth && auth.expires_at && new Date(auth.expires_at) <= new Date();
                  
                  return (
                    <div className="mb-4 p-4 rounded-lg border-2" style={{ 
                      backgroundColor: isAuthorized ? '#F0FDF4' : '#FEF2F2',
                      borderColor: isAuthorized ? '#86EFAC' : '#FECACA'
                    }}>
                      <label className="text-sm font-medium text-gray-700">File Access Status</label>
                      <div className="mt-1 flex items-center gap-2">
                        {isAuthorized ? (
                          <>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              ✓ Authorized
                            </span>
                            {auth.expires_at && (
                              <span className="text-xs text-green-700">
                                Until {new Date(auth.expires_at).toLocaleDateString()}
                              </span>
                            )}
                          </>
                        ) : isExpired ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            ⚠️ Authorization Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                            🔒 Not Authorized
                          </span>
                        )}
                      </div>
                      {!isAuthorized && (
                        <>
                          <p className="mt-2 text-xs text-gray-600">
                            Patient must grant you access through their mobile app
                          </p>
                          <button
                            onClick={handleRequestAccess}
                            disabled={requestAccessMutation.isPending}
                            className="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                          >
                            {requestAccessMutation.isPending ? 'Sending...' : '📨 Request Access'}
                          </button>
                        </>
                      )}
                    </div>
                  );
                })()}
                
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
                  <p className="text-gray-900">{selectedPatient.phone || 'Not provided'}</p>
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
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                        <div className="flex items-center flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-gray-600 mr-2 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 truncate font-medium">{file.filename || file.name || 'Unknown file'}</p>
                            <p className="text-xs text-gray-500">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => handleViewFile(file.id, file.filename || file.name || 'file')}
                            disabled={loadingFileId === file.id}
                            className={`p-1.5 rounded transition-colors flex-shrink-0 relative ${
                              loadingFileId === file.id 
                                ? 'bg-blue-100 cursor-wait' 
                                : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            title={loadingFileId === file.id ? "Loading..." : "View file"}
                          >
                            {loadingFileId === file.id ? (
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <ExternalLink className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDownloadFile(file.id)}
                            disabled={loadingFileId === file.id}
                            className={`p-1.5 rounded transition-colors flex-shrink-0 ${
                              loadingFileId === file.id
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-primary-600 hover:bg-primary-50'
                            }`}
                            title="Download file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
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
                <button 
                  onClick={() => navigate('/appointments', { 
                    state: { 
                      patientId: selectedPatient.id,
                      patientName: selectedPatient.name 
                    } 
                  })}
                  className="w-full btn-secondary"
                >
                  <Calendar className="w-4 h-4 mr-2 inline" />
                  View Appointments
                </button>
                <button 
                  onClick={() => navigate('/prescriptions', { 
                    state: { 
                      selectedPatient: {
                        id: selectedPatient.id,
                        name: selectedPatient.name,
                        email: selectedPatient.email,
                        phone: selectedPatient.phone
                      }
                    } 
                  })}
                  className="w-full btn-secondary"
                >
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

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={closePreview}>
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-full">
              <div className="flex items-center justify-between p-4 border-b bg-white flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{previewFile.name}</h3>
                <button
                  onClick={closePreview}
                  className="text-gray-400 hover:text-gray-600 transition-colors ml-4 flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-auto flex-1 flex items-center justify-center bg-gray-50">
                {previewFile.type.startsWith('image/') ? (
                  <img 
                    src={previewFile.url} 
                    alt={previewFile.name} 
                    className="max-w-full max-h-full object-contain rounded shadow-lg"
                    style={{ maxHeight: 'calc(90vh - 120px)' }}
                    onError={(e) => {
                      console.error('Image failed to load:', previewFile.url);
                      e.currentTarget.src = '';
                    }}
                  />
                ) : previewFile.type === 'application/pdf' ? (
                  <div className="w-full h-full flex flex-col">
                    <object 
                      data={previewFile.url}
                      type="application/pdf"
                      className="w-full flex-1 rounded border-2 border-gray-200" 
                      style={{ minHeight: '70vh' }}
                    >
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">PDF preview not available in your browser</p>
                        <a 
                          href={previewFile.url} 
                          download={previewFile.name}
                          className="inline-flex items-center mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </a>
                      </div>
                    </object>
                    <div className="mt-4 text-center">
                      <a 
                        href={previewFile.url} 
                        download={previewFile.name}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Preview not available for this file type</p>
                    <p className="text-sm text-gray-500 mt-2">Type: {previewFile.type}</p>
                    <p className="text-sm text-gray-500 mt-2">Click download to save the file</p>
                    <a 
                      href={previewFile.url} 
                      download={previewFile.name}
                      className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                    >
                      Download File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
