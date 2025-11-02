import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { User, Mail, Phone, MapPin, Briefcase, Save, Camera, RefreshCw, Upload, X } from 'lucide-react';

interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  qualifications?: string;
  experience?: string;
  hospital?: string;
  address?: string;
  bio?: string;
  avatar?: string;
  profilePhoto?: string;
}

const Settings: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<DoctorProfile>({
    id: '',
    name: '',
    email: '',
    phone: '',
    specialty: '',
    qualifications: '',
    experience: '',
    hospital: '',
    address: '',
    bio: '',
    avatar: '',
    profilePhoto: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch doctor profile
  const { data: doctorProfile, isLoading, refetch } = useQuery<DoctorProfile>({
    queryKey: ['doctorProfile'],
    queryFn: async () => {
      const response = await api.get('/doctor/profile');
      return response.data;
    },
  });

  // Update profile state when data is loaded
  useEffect(() => {
    if (doctorProfile) {
      setProfile(doctorProfile);
    }
  }, [doctorProfile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedProfile: Partial<DoctorProfile>) => {
      const response = await api.put('/doctor/profile', updatedProfile);
      return response.data;
    },
    onSuccess: () => {
      alert('Profile updated successfully!');
      setIsEditing(false);
      refetch();
    },
    onError: (error: any) => {
      console.error('Update profile error:', error);
      alert(error.response?.data?.error || 'Failed to update profile');
    },
  });

  const handleSave = () => {
    if (!profile.name) {
      alert('Name is required');
      return;
    }
    // Send all profile fields including photo
    updateProfileMutation.mutate({
      name: profile.name,
      specialty: profile.specialty || '',
      phone: profile.phone || '',
      qualifications: profile.qualifications || '',
      experience: profile.experience || '',
      hospital: profile.hospital || '',
      address: profile.address || '',
      bio: profile.bio || '',
      profilePhoto: photoPreview || profile.profilePhoto || '',
    });
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingPhoto(true);

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhotoPreview(base64String);
      setUploadingPhoto(false);
    };
    reader.onerror = () => {
      alert('Failed to read image file');
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    if (doctorProfile) {
      setProfile(doctorProfile);
    }
    setPhotoPreview(null);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your profile and account settings</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
          title="Refresh profile"
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700 font-medium">Refresh</span>
        </button>
      </div>

      {/* Profile Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-all duration-200"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Avatar Section */}
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
          <div className="relative">
            {(photoPreview || profile.profilePhoto || profile.avatar) ? (
              <img
                src={photoPreview || profile.profilePhoto || profile.avatar}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border-4 border-gray-200">
                <User className="w-12 h-12 text-white" />
              </div>
            )}
            {isEditing && (
              <div className="absolute bottom-0 right-0 flex gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 disabled:opacity-50 shadow-lg"
                  title="Upload photo"
                >
                  {uploadingPhoto ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                {photoPreview && (
                  <button
                    onClick={handleRemovePhoto}
                    className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 shadow-lg"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{profile.name || 'Doctor Name'}</h3>
            <p className="text-gray-600">{profile.specialty || 'Specialty'}</p>
            <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
            {isEditing && (
              <p className="text-xs text-blue-600 mt-2">
                <Upload className="w-3 h-3 inline mr-1" />
                Click camera icon to upload photo (max 5MB)
              </p>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Full Name *
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Dr. John Smith"
              />
            ) : (
              <p className="text-gray-900 py-2">{profile.name || 'Not provided'}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address *
            </label>
            <p className="text-gray-900 py-2 bg-gray-50 px-4 rounded-lg">{profile.email}</p>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 234-567-8900"
              />
            ) : (
              <p className="text-gray-900 py-2">{profile.phone || 'Not provided'}</p>
            )}
          </div>

          {/* Specialty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4 inline mr-1" />
              Specialty
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.specialty || ''}
                onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="General Physician, Cardiologist, etc."
              />
            ) : (
              <p className="text-gray-900 py-2">{profile.specialty || 'Not provided'}</p>
            )}
          </div>

          {/* Qualifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualifications
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.qualifications || ''}
                onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="MBBS, MD, etc."
              />
            ) : (
              <p className="text-gray-900 py-2">{profile.qualifications || 'Not provided'}</p>
            )}
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.experience || ''}
                onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10 years"
              />
            ) : (
              <p className="text-gray-900 py-2">{profile.experience || 'Not provided'}</p>
            )}
          </div>

          {/* Hospital */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hospital/Clinic
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.hospital || ''}
                onChange={(e) => setProfile({ ...profile, hospital: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City General Hospital"
              />
            ) : (
              <p className="text-gray-900 py-2">{profile.hospital || 'Not provided'}</p>
            )}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Address
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.address || ''}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123 Medical Street, City, State, ZIP"
              />
            ) : (
              <p className="text-gray-900 py-2">{profile.address || 'Not provided'}</p>
            )}
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio / About
            </label>
            {isEditing ? (
              <textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about yourself, your expertise, and what you specialize in..."
              />
            ) : (
              <p className="text-gray-900 py-2">{profile.bio || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Account ID</span>
            <span className="text-gray-900 font-mono text-sm">{profile.id?.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Account Type</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Doctor
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
