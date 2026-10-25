import React, { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import { MoreVertical, GripVertical, Upload, X } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import { endpoints } from "@/lib/api/endpoints";

const formatAmenities = (amenities: any): string[] => {
  const unwrap = (value: any): string[] => {
    if (value == null || value === "") return [];
    if (Array.isArray(value)) return value.flatMap(unwrap);
    if (typeof value !== "string") return [String(value)];
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) || typeof parsed === "string") {
        return unwrap(parsed);
      }
    } catch {
      // not JSON
    }
    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  return unwrap(amenities).filter(
    (item) => item && item !== "*" && item !== "[]" && item !== "[*]",
  );
};

const SortableRoomCard = ({
  room,
  dropdownOpenId,
  setDropdownOpenId,
  onEditRoom,
  onDeleteRoom,
  onDeletePhoto,
}: {
  room: any;
  dropdownOpenId: any;
  setDropdownOpenId: React.Dispatch<React.SetStateAction<any>>;
  onEditRoom: (room: any) => void;
  onDeleteRoom: (roomId: string) => void;
  onDeletePhoto: (roomId: string, publicId: string) => void;
}) => {
  const roomId = String(room._id);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: roomId });

  const isMenuOpen = dropdownOpenId === room._id;
  const amenities = formatAmenities(room.amenities);
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging || isMenuOpen ? 30 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative overflow-visible p-4 rounded-xl shadow-md border bg-white ${
        isDragging ? "shadow-lg ring-2 ring-indigo-300" : ""
      }`}
    >
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 cursor-grab"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5" />
          <span className="sr-only">Drag room to reorder</span>
        </button>
        <div className="relative" data-card-menu>
          <button
            type="button"
            onClick={() =>
              setDropdownOpenId((prevId) =>
                prevId === room._id ? null : room._id,
              )
            }
          >
            <MoreVertical className="w-5 h-5 text-gray-700" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-30 w-36">
              <button
                type="button"
                onClick={() => onDeleteRoom(room._id)}
                className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
              >
                Delete Room
              </button>
              <button
                type="button"
                onClick={() => onEditRoom(room)}
                className="block w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 text-left"
              >
                Edit Room
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-1 pr-16">
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
        {amenities.length > 0 ? (
          <ul className="list-disc ml-5 text-gray-700">
            {amenities.map((amenity, index) => (
              <li key={`${amenity}-${index}`}>{amenity}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 ml-1">No amenities</p>
        )}
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
              <button
                type="button"
                onClick={() => onDeletePhoto(room._id, photo.public_id)}
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
  );
};

const RoomManager = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!dropdownOpenId) return;

    const closeIfOutside = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-card-menu]")) return;
      setDropdownOpenId(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDropdownOpenId(null);
    };

    document.addEventListener("pointerdown", closeIfOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeIfOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [dropdownOpenId]);
  const [selectedPhotos, setSelectedPhotos] = useState<any[]>([]);
  const [editingRoomId, setEditingRoomId] = useState<any>(null);

  const [formData, setFormData] = useState({
    roomNumber: "",
    roomType: "",
    capacity: 2,
    pricePerNight: "",
    amenities: "",
  });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

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
      roomPayload.append("roomNumber", String(formData.roomNumber));
      roomPayload.append("roomType", formData.roomType);
      roomPayload.append("capacity", String(formData.capacity));
      roomPayload.append("pricePerNight", String(formData.pricePerNight));
      roomPayload.append("amenities", formData.amenities);

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
      amenities: formatAmenities(room.amenities).join(", "),
    });
    setSelectedPhotos([]);
    setEditingRoomId(room._id);
    setIsModalOpen(true);
    setDropdownOpenId(null);
  };

  const handleDeleteRoom = async (roomId) => {
    setDropdownOpenId(null);
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

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = rooms.findIndex(
        (room) => String(room._id) === String(active.id),
      );
      const newIndex = rooms.findIndex(
        (room) => String(room._id) === String(over.id),
      );
      if (oldIndex < 0 || newIndex < 0) return;

      const previous = rooms;
      const reordered = arrayMove(rooms, oldIndex, newIndex);
      setRooms(reordered);
      void api
        .post(`${endpoints.room}/reorder`, {
          orderedIds: reordered.map((room) => String(room._id)),
        })
        .then(() => toast.success("Rooms reordered"))
        .catch((err) => {
          toast.error(
            err?.response?.data?.message || "Failed to reorder rooms",
          );
          setRooms(previous);
          void fetchRooms();
        });
    },
    [rooms],
  );

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
      <h2 className="text-2xl font-bold mb-4">Room Manager</h2>

      <button
        onClick={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mb-6"
      >
        + Create Room
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingRoomId ? "Edit Room" : "Create Room"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
                disabled={creatingRoom}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Room number*
                  </label>
                  <input
                    type="number"
                    value={formData.roomNumber}
                    placeholder="e.g. 101"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        roomNumber: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Type*
                  </label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => handleRoomTypeChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select room type</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Premium">Premium</option>
                    <option value="Normal AC Room">Normal AC Room</option>
                    <option value="Single Room">Single Room</option>
                    <option value="Double Room">Double Room</option>
                    <option value="Family Room">Family Room</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        capacity: Number(e.target.value),
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Price per night*
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-gray-500">
                      Rs.
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.pricePerNight}
                      placeholder="0"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pricePerNight: e.target.value,
                        }))
                      }
                      className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Amenities
                  </label>
                  <input
                    type="text"
                    value={formData.amenities}
                    placeholder="WiFi, TV, AC"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        amenities: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Photos
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-4 pb-4">
                      <Upload className="text-gray-500 mb-2" size={24} />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or
                        drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, JPEG</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {selectedPhotos.length > 0 && (
                  <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedPhotos.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${idx}`}
                          className="h-24 w-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedPhotos((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                          className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={creatingRoom}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateOrUpdateRoom}
                  disabled={creatingRoom}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={() => setDropdownOpenId(null)}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={rooms.map((room) => String(room._id))}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <SortableRoomCard
                key={room._id}
                room={room}
                dropdownOpenId={dropdownOpenId}
                setDropdownOpenId={setDropdownOpenId}
                onEditRoom={handleEditRoom}
                onDeleteRoom={handleDeleteRoom}
                onDeletePhoto={handleDeletePhoto}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default RoomManager;
