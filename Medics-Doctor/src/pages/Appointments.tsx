import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Clock, User, Phone, MapPin, CheckCircle, XCircle, AlertCircle, RefreshCw, X } from 'lucide-react';
import { format } from 'date-fns';
import type { Appointment } from '../types';

const Appointments: React.FC = () => {
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [patientFilter, setPatientFilter] = useState<{ id: string; name: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const queryClient = useQueryClient();

  // Check if patient was passed from Patients page
  useEffect(() => {
    if (location.state?.patientId && location.state?.patientName) {
      setPatientFilter({
        id: location.state.patientId,
        name: location.state.patientName
      });
    }
    
    // Check if appointment was passed from Dashboard
    if (location.state?.selectedAppointment) {
      setSelectedAppointment(location.state.selectedAppointment);
    }
  }, [location.state]);

  const { data: appointments, isLoading, refetch } = useQuery<Appointment[]>({
    queryKey: ['appointments', selectedDate, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      console.log('Fetching appointments:', `/doctor/appointments?${params.toString()}`);
      const response = await api.get(`/doctor/appointments?${params.toString()}`);
      console.log('Appointments response:', response.data);
      return response.data.appointments || [];
    },
  });

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      // Confirmation dialog for certain actions
      if (newStatus === 'cancelled') {
        if (!confirm('Are you sure you want to cancel this appointment?')) {
          return;
        }
      } else if (newStatus === 'completed') {
        if (!confirm('Mark this appointment as completed?')) {
          return;
        }
      }

      await api.patch(`/doctor/appointments/${appointmentId}`, { status: newStatus });
      
      // Show success message
      const messages: Record<string, string> = {
        confirmed: 'Appointment confirmed successfully!',
        cancelled: 'Appointment cancelled successfully!',
        completed: 'Appointment marked as completed!',
      };
      
      alert(messages[newStatus] || 'Appointment updated successfully!');
      
      refetch();
    } catch (error) {
      console.error('Failed to update appointment:', error);
      alert('Failed to update appointment. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your patient appointments</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-all ${
            isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Refresh appointments"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-gray-700 font-medium">Refresh</span>
        </button>
      </div>

      {/* Patient Filter Badge */}
      {patientFilter && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <User className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            Showing appointments for: {patientFilter.name}
          </span>
          <button
            onClick={() => setPatientFilter(null)}
            className="ml-auto p-1 hover:bg-blue-100 rounded transition-colors"
            title="Clear filter"
          >
            <X className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Appointments</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        ) : appointments && appointments.length > 0 ? (
          appointments
            .filter(appointment => {
              // Filter by patient if patientFilter is set
              if (patientFilter && appointment.patient?.id !== patientFilter.id) {
                return false;
              }
              return true;
            })
            .map((appointment) => (
            <div key={appointment.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(appointment.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.patient?.name || 'Patient'}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {appointment.appointmentTime}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {appointment.patient?.phone || 'N/A'}
                        </div>
                        {appointment.reason && (
                          <div className="flex items-start md:col-span-2">
                            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{appointment.reason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 md:mt-0 md:ml-6 flex flex-wrap gap-2">
                  {appointment.status.toLowerCase() === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {appointment.status.toLowerCase() === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => setSelectedAppointment(appointment)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No appointments found</p>
            <p className="text-gray-400 text-sm mt-2">Try selecting a different date or status filter</p>
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusBadge(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
                <span className="text-sm text-gray-500">
                  ID: {selectedAppointment.id.slice(0, 8)}...
                </span>
              </div>

              {/* Patient Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-gray-600 font-medium">Name</label>
                    <p className="text-gray-900">{selectedAppointment.patient?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 font-medium">Email</label>
                    <p className="text-gray-900">{selectedAppointment.patient?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 font-medium">Phone</label>
                    <p className="text-gray-900">{selectedAppointment.patient?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Appointment Information */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  Appointment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-gray-600 font-medium">Date</label>
                    <p className="text-gray-900">
                      {selectedAppointment.appointmentDate ? format(new Date(selectedAppointment.appointmentDate), 'PPP') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600 font-medium">Time</label>
                    <p className="text-gray-900">{selectedAppointment.appointmentTime || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 font-medium">Specialty</label>
                    <p className="text-gray-900">{selectedAppointment.specialty || 'General Consultation'}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 font-medium">Hospital</label>
                    <p className="text-gray-900">{selectedAppointment.hospitalName || 'N/A'}</p>
                  </div>
                  {selectedAppointment.hospitalAddress && (
                    <div className="md:col-span-2">
                      <label className="text-gray-600 font-medium flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Address
                      </label>
                      <p className="text-gray-900">{selectedAppointment.hospitalAddress}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reason for Visit */}
              {selectedAppointment.reason && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-purple-600" />
                    Reason for Visit
                  </h3>
                  <p className="text-gray-900">{selectedAppointment.reason}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedAppointment.status.toLowerCase() === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedAppointment.id, 'confirmed');
                        setSelectedAppointment(null);
                      }}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                    >
                      Confirm Appointment
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedAppointment.id, 'cancelled');
                        setSelectedAppointment(null);
                      }}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                    >
                      Cancel Appointment
                    </button>
                  </>
                )}
                {selectedAppointment.status.toLowerCase() === 'confirmed' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedAppointment.id, 'completed');
                        setSelectedAppointment(null);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                    >
                      Mark as Completed
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedAppointment.id, 'cancelled');
                        setSelectedAppointment(null);
                      }}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                    >
                      Cancel Appointment
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
