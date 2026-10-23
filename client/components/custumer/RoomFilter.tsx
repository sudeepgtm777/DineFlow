// @ts-nocheck
import React from "react";
import { FiX } from "react-icons/fi";

const RoomFilter = ({ filters, setFilters, onClose }) => {
  const roomTypes = ["Standard", "Deluxe", "Suite", "Executive", "Family"];
  const amenitiesList = ["WiFi", "TV", "AC", "Mini Bar", "Safe", "Balcony", "Sea View"];

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Filter Rooms</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <FiX size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Room Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
          <select
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.roomType}
            onChange={(e) => setFilters({...filters, roomType: e.target.value})}
          >
            <option value="">All Types</option>
            {roomTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Range: Rs. {filters.priceRange[0]} - Rs. {filters.priceRange[1]}
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="10000"
              step="500"
              value={filters.priceRange[0]}
              onChange={(e) => setFilters({...filters, priceRange: [parseInt(e.target.value), filters.priceRange[1]]})}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="10000"
              step="500"
              value={filters.priceRange[1]}
              onChange={(e) => setFilters({...filters, priceRange: [filters.priceRange[0], parseInt(e.target.value)]})}
              className="w-full"
            />
          </div>
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Capacity</label>
          <select
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.capacity}
            onChange={(e) => setFilters({...filters, capacity: parseInt(e.target.value)})}
          >
            <option value="0">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="4">4+</option>
            <option value="6">6+</option>
          </select>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
          <div className="grid grid-cols-2 gap-2">
            {amenitiesList.map(amenity => (
              <label key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(amenity)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilters({...filters, amenities: [...filters.amenities, amenity]});
                    } else {
                      setFilters({...filters, amenities: filters.amenities.filter(a => a !== amenity)});
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{amenity}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6 space-x-3">
        <button
          onClick={() => setFilters({
            roomType: "",
            priceRange: [0, 1000],
            capacity: 0,
            amenities: []
          })}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          Reset All
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default RoomFilter;