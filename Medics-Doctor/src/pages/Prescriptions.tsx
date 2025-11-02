import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { Plus, Search, Trash2, FileText, User, Save, X, RefreshCw } from 'lucide-react';
import type { Patient, Medicine, PrescriptionItem } from '../types';

const Prescriptions: React.FC = () => {
  const location = useLocation();
  const [searchPatient, setSearchPatient] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('A');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [showMedicineSearch, setShowMedicineSearch] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Auto-select patient if coming from Patients page
  useEffect(() => {
    if (location.state?.selectedPatient) {
      setSelectedPatient(location.state.selectedPatient);
      // Clear the search since patient is already selected
      setSearchPatient('');
    }
  }, [location.state]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Search patients
  const { data: patients } = useQuery<Patient[]>({
    queryKey: ['searchPatients', searchPatient],
    queryFn: async () => {
      if (!searchPatient) return [];
      const response = await api.get(`/doctor/patients?search=${encodeURIComponent(searchPatient)}`);
      return response.data.patients || [];
    },
    enabled: searchPatient.length > 2,
  });

  // Fetch medicines by letter
  const { data: medicines, isLoading: medicinesLoading } = useQuery<Medicine[]>({
    queryKey: ['medicines', selectedLetter],
    queryFn: async () => {
      const response = await api.get(`/doctor/medicines?search=${selectedLetter}`);
      return response.data.medicines || [];
    },
    enabled: showMedicineSearch,
  });

  // Create prescription mutation
  const createPrescription = useMutation({
    mutationFn: async () => {
      const response = await api.post('/prescriptions', {
        patientId: selectedPatient?.id,
        items: prescriptionItems,
        diagnosis,
        notes,
      });
      return response.data;
    },
    onSuccess: () => {
      // Reset form
      setSelectedPatient(null);
      setPrescriptionItems([]);
      setDiagnosis('');
      setNotes('');
      setSearchPatient('');
      alert('Prescription created successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to create prescription');
    },
  });

  const addMedicine = (medicine: Medicine) => {
    const newItem: PrescriptionItem = {
      medicineId: medicine.id,
      medicine,
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    };
    setPrescriptionItems([...prescriptionItems, newItem]);
    setShowMedicineSearch(false);
  };

  const updateItem = (index: number, field: keyof PrescriptionItem, value: string) => {
    const updated = [...prescriptionItems];
    updated[index] = { ...updated[index], [field]: value };
    setPrescriptionItems(updated);
  };

  const removeItem = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!selectedPatient) {
      alert('Please select a patient');
      return;
    }
    if (prescriptionItems.length === 0) {
      alert('Please add at least one medicine');
      return;
    }
    const incomplete = prescriptionItems.some(
      (item) => !item.dosage || !item.frequency || !item.duration
    );
    if (incomplete) {
      alert('Please fill in dosage, frequency, and duration for all medicines');
      return;
    }
    createPrescription.mutate();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['searchPatients'] }),
        queryClient.invalidateQueries({ queryKey: ['medicines'] })
      ]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Prescription</h1>
          <p className="text-gray-600 mt-1">Prescribe medicines to your patients</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient by name..."
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {selectedPatient && (
              <div className="mt-4 p-4 bg-primary-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedPatient.name}</p>
                    <p className="text-sm text-gray-600">{selectedPatient.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {patients && patients.length > 0 && !selectedPatient && (
              <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg">
                {patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className="w-full px-4 py-3 hover:bg-gray-50 text-left border-b last:border-b-0"
                  >
                    <p className="font-medium text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-600">{patient.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Diagnosis */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnosis</h3>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter diagnosis..."
              className="input-field min-h-24"
            />
          </div>

          {/* Medicines */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Medicines</h3>
              <button
                onClick={() => setShowMedicineSearch(!showMedicineSearch)}
                className="btn-primary py-2 px-4"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Add Medicine
              </button>
            </div>

            {showMedicineSearch && (
              <div className="mb-4">
                {/* Alphabet Index */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Select Starting Letter:</p>
                  <div className="flex flex-wrap gap-2">
                    {alphabet.map((letter) => (
                      <button
                        key={letter}
                        onClick={() => setSelectedLetter(letter)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                          selectedLetter === letter
                            ? 'bg-[#0091F5] text-white shadow-md scale-110'
                            : 'bg-white text-gray-700 hover:bg-[#E6F4FE] border border-gray-200'
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Medicine List */}
                {medicinesLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0091F5]"></div>
                    <p className="text-gray-600 mt-2">Loading medicines...</p>
                  </div>
                ) : medicines && medicines.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                    <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-700">
                        Medicines starting with "{selectedLetter}" ({medicines.length} found)
                      </p>
                    </div>
                    {medicines.map((medicine) => (
                      <button
                        key={medicine.id}
                        onClick={() => addMedicine(medicine)}
                        className="w-full px-4 py-3 bg-white hover:bg-blue-50 text-left border-b border-gray-200 last:border-b-0 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-base mb-1">
                              {medicine.name || 'Unnamed Medicine'}
                            </p>
                            {medicine.size && (
                              <p className="text-sm text-gray-600">{medicine.size}</p>
                            )}
                            {medicine.manufacturer && (
                              <p className="text-xs text-gray-500 mt-1">
                                Manufacturer: {medicine.manufacturer}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-[#0091F5] text-lg mb-1">₹{medicine.price}</p>
                            {medicine.category && (
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {medicine.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No medicines found starting with "{selectedLetter}"</p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              {prescriptionItems.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{item.medicine?.name}</p>
                      <p className="text-sm text-gray-600">{item.medicine?.description}</p>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 500mg"
                        value={item.dosage}
                        onChange={(e) => updateItem(index, 'dosage', e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Twice daily"
                        value={item.frequency}
                        onChange={(e) => updateItem(index, 'frequency', e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 7 days"
                        value={item.duration}
                        onChange={(e) => updateItem(index, 'duration', e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Take after meals"
                      value={item.instructions}
                      onChange={(e) => updateItem(index, 'instructions', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
              ))}

              {prescriptionItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No medicines added. Click "Add Medicine" to get started.
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional instructions or notes..."
              className="input-field min-h-24"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={createPrescription.isPending}
            className="w-full btn-primary py-3 text-lg disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2 inline" />
            {createPrescription.isPending ? 'Creating Prescription...' : 'Create Prescription'}
          </button>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Patient</label>
                <p className="text-gray-900 font-medium">
                  {selectedPatient?.name || 'Not selected'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Medicines</label>
                <p className="text-gray-900 font-medium">{prescriptionItems.length} items</p>
              </div>

              {prescriptionItems.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">
                    Prescribed Medicines
                  </label>
                  <ul className="space-y-2">
                    {prescriptionItems.map((item, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        • {item.medicine?.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {diagnosis && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Diagnosis</label>
                  <p className="text-gray-900 text-sm">{diagnosis}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="bg-blue-50 p-4 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-sm text-blue-900 font-medium">
                  Prescription will be sent to patient's app
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Patient can order medicines directly from the app
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;
