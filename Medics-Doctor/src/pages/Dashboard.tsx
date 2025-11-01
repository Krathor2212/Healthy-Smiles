import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Calendar, Users, FileText, Activity } from 'lucide-react';
import type { Appointment } from '../types';

const Dashboard: React.FC = () => {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/doctor/stats');
      return response.data;
    },
  });

  // Fetch today's appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ['todayAppointments'],
    queryFn: async () => {
      const response = await api.get('/appointments/today');
      return response.data.appointments || [];
    },
  });

  const statCards = [
    {
      title: 'Today\'s Appointments',
      value: stats?.todayAppointments || 0,
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
    },
    {
      title: 'Total Patients',
      value: stats?.totalPatients || 0,
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-500',
    },
    {
      title: 'Prescriptions Issued',
      value: stats?.prescriptionsIssued || 0,
      icon: FileText,
      color: 'bg-purple-500',
      textColor: 'text-purple-500',
    },
    {
      title: 'Active Patients',
      value: stats?.activePatients || 0,
      icon: Activity,
      color: 'bg-orange-500',
      textColor: 'text-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {statsLoading ? '...' : stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
          <a href="/appointments" className="text-[#0091F5] hover:text-[#0074C4] font-medium text-sm">
            View All
          </a>
        </div>

        {appointmentsLoading ? (
          <div className="text-center py-8 text-gray-500">Loading appointments...</div>
        ) : appointments && appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#E6F4FE] rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#0091F5]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {appointment.patient?.name || 'Patient'}
                    </p>
                    <p className="text-sm text-gray-600">{appointment.reason || 'General checkup'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{appointment.appointmentTime}</p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No appointments scheduled for today</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/appointments"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Manage Appointments</p>
              <p className="text-sm text-gray-600">View and schedule</p>
            </div>
          </div>
        </a>

        <a
          href="/patients"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Patient Records</p>
              <p className="text-sm text-gray-600">View medical history</p>
            </div>
          </div>
        </a>

        <a
          href="/prescriptions"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Create Prescription</p>
              <p className="text-sm text-gray-600">Issue new prescription</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Dashboard;
