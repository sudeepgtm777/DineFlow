// @ts-nocheck
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "@/lib/router";
import { MoreVertical } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import { endpoints } from "@/lib/api/endpoints";

const RoomManager = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [editingRoomId, setEditingRoomId] = useState(null);

  const [formData, setFormData] = useState({
    roomNumber: "",
    roomType: "",
    capacity: 2,
    pricePerNight: "",
    amenities: "",
  });

  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${endpoints.room}/getrooms`);
      setRooms(res?.data || []);
    } catch (err) {
      console.error("Fetch rooms error:", err);
      toast.error("Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      roomNumber: "",
      roomType: "",
      capacity: 2,
      pricePerNight: "",
      amenities: "",
    });
    setSelectedPhotos([]);
    setEditingRoomId(null);
  };

  

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedPhotos((prev) => [...prev, ...files]);
  };

  const handleCreateOrUpdateRoom = async () => {
    const { roomNumber, roomType, pricePerNight } = formData;

    if (!roomNumber || !roomType || !pricePerNight) {
      toast.warning("Room number, type, and price are required.");
      return;
    }

    try {
      setCreatingRoom(true);
      const roomPayload = new FormData();
      roomPayload.append("roomNumber", Number(formData.roomNumber));
      roomPayload.append("roomType", formData.roomType);
      roomPayload.append("capacity", formData.capacity);
      roomPayload.append("pricePerNight", Number(formData.pricePerNight));
      roomPayload.append(
        "amenities",
        JSON.stringify(formData.amenities.split(",").map((a) => a.trim()))
      );

      selectedPhotos.forEach((photo) => {
        roomPayload.append("images", photo);
      });

      if (editingRoomId) {
        await api.put(
          `${endpoints.room}/update/${editingRoomId}`,
          roomPayload,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Room updated successfully!");
      } else {
        await api.post(`${endpoints.room}/create`, roomPayload, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Room created successfully!");
      }

      resetForm();
      setIsModalOpen(false);
      fetchRooms();
    } catch (err) {
      console.error("Room error:", err);
      toast.error(err?.response?.data?.message || "Failed to submit room.");
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleEditRoom = (room) => {
    setFormData({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      capacity: room.capacity,
      pricePerNight: room.pricePerNight,
      amenities: room.amenities?.join(", "),
    });
    setSelectedPhotos([]);
    setEditingRoomId(room._id);
    setIsModalOpen(true);
    setDropdownOpenId(null);
  };

  const handleDeleteRoom = async (roomId) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this room?"
    );
    if (!confirm) return;

    try {
      await api.delete(`${endpoints.room}/delete/${roomId}`, {
        withCredentials: true,
      });
      toast.success("Room deleted.");
      fetchRooms();
    } catch (err) {
      toast.error("Failed to delete room.");
    }
  };

  // === New: Delete photo button handler ===
  const handleDeletePhoto = async (roomId, public_id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this photo?"
    );
    if (!confirm) return;

    try {
      await api.delete(`${endpoints.room}/deletephoto/${roomId}`, {
        data: { public_id },
        withCredentials: true,
      });
      toast.success("Photo deleted.");

      // Remove the photo from rooms state without refetching
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room._id === roomId
            ? {
                ...room,
                photos: room.photos.filter(
                  (photo) => photo.public_id !== public_id
                ),
              }
            : room
        )
      );
    } catch (err) {
      toast.error("Failed to delete photo.");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleRoomTypeChange = (value) => {
    let newCapacity = formData.capacity;
    if (value === "Single Room") {
      newCapacity = 1;
    }
    setFormData((prev) => ({
      ...prev,
      roomType: value,
      capacity: newCapacity,
    }));
  };

  return (
    <div className="p-6">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Room Manager</h2>

      <button
        onClick={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-6"
      >
        + Create Room
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="absolute top-2 right-3 text-gray-600 text-2xl"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {editingRoomId ? "Edit Room" : "Create Room"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="number"
                value={formData.roomNumber}
                placeholder="Room Number"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    roomNumber: e.target.value,
                  }))
                }
                className="border border-gray-300 rounded px-3 py-2 w-full"
              />

              <select
                value={formData.roomType}
                onChange={(e) => handleRoomTypeChange(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
              >
                <option value="">Select Room Type</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Premium">Premium</option>
                <option value="Normal AC Room">Normal AC Room</option>
                <option value="Single Room">Single Room</option>
                <option value="Double Room">Double Room</option>
                <option value="Family Room">Family Room</option>
              </select>

              <input
                type="number"
                value={formData.capacity}
                placeholder="Capacity"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, capacity: e.target.value }))
                }
                className="border border-gray-300 rounded px-3 py-2 w-full"
              />

              <input
                type="number"
                value={formData.pricePerNight}
                placeholder="Price per Night"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pricePerNight: e.target.value,
                  }))
                }
                className="border border-gray-300 rounded px-3 py-2 w-full"
              />

              <input
                type="text"
                value={formData.amenities}
                placeholder="Amenities (comma-separated)"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    amenities: e.target.value,
                  }))
                }
                className="md:col-span-2 border border-gray-300 rounded px-3 py-2 w-full"
              />

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoSelect}
                className="md:col-span-2 border border-gray-300 rounded px-3 py-2"
              />

              {selectedPhotos.length > 0 && (
                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {selectedPhotos.map((file, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${idx}`}
                        className="h-24 w-full object-cover rounded border"
                      />
                      <button
                        onClick={() =>
                          setSelectedPhotos((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleCreateOrUpdateRoom}
                disabled={creatingRoom}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {creatingRoom
                  ? editingRoomId
                    ? "Updating..."
                    : "Creating..."
                  : editingRoomId
                  ? "Update Room"
                  : "Create Room"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="relative p-4 rounded-xl shadow-md border bg-white"
          >
            <div className="absolute top-2 right-2">
              <button
                onClick={() =>
                  setDropdownOpenId((prevId) =>
                    prevId === room._id ? null : room._id
                  )
                }
              >
                <MoreVertical className="w-5 h-5 text-gray-700" />
              </button>

              {dropdownOpenId === room._id && (
                <div className="absolute right-0 mt-2 bg-white border rounded shadow z-10 w-32">
                  <button
                    onClick={() => handleDeleteRoom(room._id)}
                    className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-100 text-left"
                  >
                    Delete Room
                  </button>
                  <button
                    onClick={() => handleEditRoom(room)}
                    className="block w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-100 text-left"
                  >
                    Edit Room
                  </button>
                </div>
              )}
            </div>

            <h3 className="text-xl font-semibold mb-1">
              Room {room.roomNumber}
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              Type: {room.roomType} | Capacity: {room.capacity}
            </p>
            <p className="text-sm mb-1">Price: Rs. {room.pricePerNight}</p>

            {room.qrImage?.url && (
              <img
                src={room.qrImage.url}
                alt={`QR for Room ${room.roomNumber}`}
                className="w-24 h-24 object-contain border my-2"
              />
            )}

            <div className="text-sm mb-2">
              <h3 className="font-semibold">Amenities:</h3>
              <ul className="list-disc ml-5 text-gray-700">
                {room.amenities?.map((amenity, index) => (
                  <li key={index}>{amenity}</li>
                ))}
              </ul>
            </div>

            {room.photos?.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {room.photos.map((photo, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={photo.url}
                      alt={`Room ${room.roomNumber} Photo ${idx}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    {/* NEW Delete Button on photo */}
                    <button
                      onClick={() =>
                        handleDeletePhoto(room._id, photo.public_id)
                      }
                      title="Delete Photo"
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-80 hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomManager;
