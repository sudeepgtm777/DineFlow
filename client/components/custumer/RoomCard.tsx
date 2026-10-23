// @ts-nocheck
import React from "react";
import { Link } from "@/lib/router";

const RoomCard = ({ room }) => {
  return (
    <Link to={`/rooms/${room.roomNumber}`}>
      <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-4">
        <img
          src={room.photos[0]?.url || room.qrImage?.url}
          alt="Room"
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h2 className="text-lg font-bold">Room {room.roomNumber} ({room.roomType})</h2>
          <p className="text-sm text-gray-600">Capacity: {room.capacity}</p>
          <p className="text-sm text-gray-800 font-semibold">Rs. {room.pricePerNight}/night</p>
          <p className={`text-sm font-medium ${room.isBooked ? "text-red-500" : "text-green-600"}`}>
            {room.isBooked ? "Booked" : "Available"}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default RoomCard;
