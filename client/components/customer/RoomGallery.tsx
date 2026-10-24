import React, { useState } from "react";

const RoomGallery = ({ photos, className }: any) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return <div className="bg-gray-200 h-64 rounded-xl flex items-center justify-center text-gray-500">
      No images available
    </div>;
  }

  return (
    <div className="space-y-4">
      {/* Featured Image */}
      <div className="relative rounded-xl overflow-hidden bg-gray-100" style={{ paddingBottom: '56.25%' }}>
        <img
          src={photos[activeIndex].url}
          alt={`Featured room image ${activeIndex + 1}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
        />
      </div>

      {/* Thumbnail Navigation */}
      {photos.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {photos.map((photo, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative rounded-md overflow-hidden transition-all duration-200 ${idx === activeIndex ? 'ring-2 ring-green-500' : 'opacity-80 hover:opacity-100'}`}
              style={{ paddingBottom: '100%' }}
            >
              <img
                src={photo.url}
                alt={`Thumbnail ${idx + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Mobile-friendly dots indicator */}
      {photos.length > 1 && (
        <div className="flex justify-center space-x-2 md:hidden">
          {photos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-3 h-3 rounded-full ${idx === activeIndex ? 'bg-green-600' : 'bg-gray-300'}`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomGallery;