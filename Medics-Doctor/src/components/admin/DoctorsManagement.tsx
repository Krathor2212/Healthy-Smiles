import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from 'lucide-react';
import adminApi from '../../services/adminApi';

const DoctorsManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditHospitalsModal, setShowEditHospitalsModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: () => adminApi.getAllDoctors(),
  });

  const { data: hospitalsData } = useQuery({
    queryKey: ['admin-hospitals'],
    queryFn: () => adminApi.getAllHospitals(),
  });

  const deleteMutation = useMutation({
    mutationFn: (doctorId: string) => adminApi.deleteDoctor(doctorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const handleDelete = async (doctorId: string, doctorName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete Dr. ${doctorName}? This action cannot be undone.`
      )
    ) {
      try {
        await deleteMutation.mutateAsync(doctorId);
        alert('Doctor deleted successfully');
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete doctor');
      }
    }
  };

  const handleEditHospitals = (doctor: any) => {
    setSelectedDoctor(doctor);
    setShowEditHospitalsModal(true);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const doctors = data?.doctors || [];
  const hospitals = hospitalsData?.hospitals || [];

  return (
    <div>
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Doctors Management
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span>
          Create New Doctor
        </button>
      </div>

      {/* Doctors Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Photo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Specialty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned Hospitals
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {doctors.map((doctor: any) => (
              <tr key={doctor.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex-shrink-0 h-10 w-10">
                    {doctor.profilePhoto ? (
                      <img
                        src={doctor.profilePhoto}
                        alt={doctor.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {doctor.name || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {doctor.email || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {doctor.specialty || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {doctor.assignedHospitals?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {doctor.assignedHospitals.map((h: any, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {h.hospitalName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      'No hospitals assigned'
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditHospitals(doctor)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit Hospitals
                  </button>
                  <button
                    onClick={() => handleDelete(doctor.id, doctor.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {doctors.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No doctors found. Create one to get started.
          </div>
        )}
      </div>

      {/* Create Doctor Modal */}
      {showCreateModal && (
        <CreateDoctorModal
          hospitals={hospitals}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
          }}
        />
      )}

      {/* Edit Hospitals Modal */}
      {showEditHospitalsModal && selectedDoctor && (
        <EditHospitalsModal
          doctor={selectedDoctor}
          hospitals={hospitals}
          onClose={() => {
            setShowEditHospitalsModal(false);
            setSelectedDoctor(null);
          }}
          onSuccess={() => {
            setShowEditHospitalsModal(false);
            setSelectedDoctor(null);
            queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
          }}
        />
      )}
    </div>
  );
};

// Create Doctor Modal
interface CreateDoctorModalProps {
  hospitals: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const CreateDoctorModal: React.FC<CreateDoctorModalProps> = ({
  hospitals,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
    hospitalIds: [] as string[],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => adminApi.createDoctor(data),
    onSuccess: () => {
      onSuccess();
      alert('Doctor created successfully');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to create doctor');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }
    createMutation.mutate(formData);
  };

  const toggleHospital = (hospitalId: string) => {
    setFormData((prev) => ({
      ...prev,
      hospitalIds: prev.hospitalIds.includes(hospitalId)
        ? prev.hospitalIds.filter((id) => id !== hospitalId)
        : [...prev.hospitalIds, hospitalId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Create New Doctor
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialty
              </label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) =>
                  setFormData({ ...formData, specialty: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Hospitals
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {hospitals.map((hospital) => (
                  <label
                    key={hospital.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.hospitalIds.includes(hospital.id)}
                      onChange={() => toggleHospital(hospital.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {hospital.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Doctor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Hospitals Modal
interface EditHospitalsModalProps {
  doctor: any;
  hospitals: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const EditHospitalsModal: React.FC<EditHospitalsModalProps> = ({
  doctor,
  hospitals,
  onClose,
  onSuccess,
}) => {
  const [selectedHospitalIds, setSelectedHospitalIds] = useState<string[]>(
    doctor.assignedHospitals?.map((h: any) => h.hospitalId) || []
  );

  const updateMutation = useMutation({
    mutationFn: (hospitalIds: string[]) =>
      adminApi.updateDoctorHospitals(doctor.id, hospitalIds),
    onSuccess: () => {
      onSuccess();
      alert('Hospital assignments updated successfully');
    },
    onError: (error: any) => {
      alert(
        error.response?.data?.message || 'Failed to update hospital assignments'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(selectedHospitalIds);
  };

  const toggleHospital = (hospitalId: string) => {
    setSelectedHospitalIds((prev) =>
      prev.includes(hospitalId)
        ? prev.filter((id) => id !== hospitalId)
        : [...prev, hospitalId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Edit Hospital Assignments
          </h3>
          <p className="text-gray-600 mb-4">
            Doctor: <span className="font-medium">{doctor.name}</span>
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3">
              {hospitals.map((hospital) => (
                <label
                  key={hospital.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedHospitalIds.includes(hospital.id)}
                    onChange={() => toggleHospital(hospital.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{hospital.name}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Assignments'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorsManagement;
