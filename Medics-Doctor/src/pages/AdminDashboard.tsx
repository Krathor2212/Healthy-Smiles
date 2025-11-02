import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import adminApi from '../services/adminApi';
import DoctorsManagement from '../components/admin/DoctorsManagement';
import PatientsView from '../components/admin/PatientsView';
import MedicinesView from '../components/admin/MedicinesView';

type TabType = 'overview' | 'doctors' | 'patients' | 'medicines';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getDashboardStats(),
  });

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'doctors', label: 'Doctors', icon: '👨‍⚕️' },
    { id: 'patients', label: 'Patients', icon: '🏥' },
    { id: 'medicines', label: 'Medicines', icon: '💊' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage doctors, view patients and medicines
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Stats Cards */}
              {statsLoading ? (
                <div className="col-span-4 text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <StatCard
                    title="Total Doctors"
                    value={stats?.stats?.totalDoctors || 0}
                    icon="👨‍⚕️"
                    color="bg-blue-500"
                  />
                  <StatCard
                    title="Total Patients"
                    value={stats?.stats?.totalPatients || 0}
                    icon="🏥"
                    color="bg-green-500"
                  />
                  <StatCard
                    title="Total Medicines"
                    value={stats?.stats?.totalMedicines || 0}
                    icon="💊"
                    color="bg-purple-500"
                  />
                  <StatCard
                    title="Total Hospitals"
                    value={stats?.stats?.totalHospitals || 0}
                    icon="🏥"
                    color="bg-orange-500"
                  />
                </>
              )}
            </div>
          )}

          {activeTab === 'doctors' && <DoctorsManagement />}
          {activeTab === 'patients' && <PatientsView />}
          {activeTab === 'medicines' && <MedicinesView />}
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${color} rounded-md p-3`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-3xl font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
