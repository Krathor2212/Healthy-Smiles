import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import adminApi from '../../services/adminApi';

const MedicinesView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-medicines'],
    queryFn: () => adminApi.getAllMedicines(),
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const medicines = data?.medicines || [];

  // Get unique categories
  const categories: string[] = ['all', ...Array.from(new Set(medicines.map((m: any) => m.category).filter(Boolean))) as string[]];

  // Filter medicines
  const filteredMedicines = medicines.filter((medicine: any) => {
    const matchesSearch = medicine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || medicine.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Medicines (View Only)</h2>
        <div className="text-sm text-gray-500">
          Total: {medicines.length} medicines
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or manufacturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-64">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Medicines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedicines.map((medicine: any) => (
          <div
            key={medicine.id}
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {medicine.name}
              </h3>
              {medicine.requires_prescription && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  Rx
                </span>
              )}
              {medicine.on_sale && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Sale
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              {medicine.description && (
                <p className="text-gray-600 line-clamp-2">
                  {medicine.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 mt-3">
                {medicine.size && (
                  <div>
                    <span className="text-gray-500">Size:</span>
                    <p className="text-gray-900">{medicine.size}</p>
                  </div>
                )}
                {medicine.price && (
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <p className="text-gray-900">
                      {medicine.currency || '₹'}{medicine.price}
                      {medicine.original_price && medicine.original_price > medicine.price && (
                        <span className="ml-2 text-xs text-gray-500 line-through">
                          {medicine.currency || '₹'}{medicine.original_price}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {medicine.manufacturer && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-gray-500">Manufacturer:</span>
                  <p className="text-gray-900">{medicine.manufacturer}</p>
                </div>
              )}

              {medicine.category && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {medicine.category}
                  </span>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                {medicine.rating > 0 && (
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 text-gray-700">{medicine.rating}</span>
                    {medicine.reviews_count > 0 && (
                      <span className="ml-1 text-xs text-gray-500">
                        ({medicine.reviews_count} reviews)
                      </span>
                    )}
                  </div>
                )}
                {medicine.stock !== undefined && (
                  <div className={`text-xs ${medicine.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {medicine.stock > 0 ? `In Stock (${medicine.stock})` : 'Out of Stock'}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMedicines.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            No medicines found matching your filters.
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Note:</span> This is a read-only view of medicines in the system. You cannot modify medicine data from this interface.
        </p>
      </div>
    </div>
  );
};

export default MedicinesView;
