// @ts-nocheck
import RoomBooking from '../models/roombook.model';
import Room from '../models/room.model';
export const bookRoomAsCustomer = async (req, res) => {
  try {
    const { roomNumber } = req.params;
    const { customerName, contactNumber } = req.body;

    const room = await Room.findOne({ roomNumber });
    if (!room) return res.status(404).json({ message: 'Room not found.' });

    const existingActiveBooking = await RoomBooking.findOne({
      room: room._id,
      status: { $in: ['booked', 'checked-in'] },
    });

    if (existingActiveBooking) {
      return res.status(400).json({ message: 'Room is already booked.' });
    }

    const booking = new RoomBooking({
      room: room._id,
      customerName,
      contactNumber,
      status: 'checked-in',
    });

    await booking.save();

    // Optionally update room.isBooked
    room.isBooked = true;
    await room.save();

    res.status(201).json({ message: 'Room booked successfully', booking });
  } catch (err) {
    console.error('Error booking room:', err);
    res
      .status(500)
      .json({ message: 'Internal server error', error: err.message });
  }
};

//update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const validStatuses = ['booked', 'checked-in', 'checked-out', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const booking = await RoomBooking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ message: 'Booking not found.' });

    booking.status = status;
    await booking.save();

    res
      .status(200)
      .json({ message: 'Booking status updated successfully', booking });
  } catch (err) {
    console.error('Error updating booking status:', err);
    res
      .status(500)
      .json({ message: 'Internal server error', error: err.message });
  }
};

//list all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await RoomBooking.find().populate('room');
    console.log('Fetched bookings:', bookings);

    res.status(200).json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res
      .status(500)
      .json({ message: 'Internal server error', error: err.message });
  }
};
