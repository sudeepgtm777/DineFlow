import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, 'Fullname is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: function (value) {
          // Must be exactly 10 digits and start with 9
          return /^9\d{9}$/.test(value);
        },
        message: 'Phone number must be 10 digits and start with 9',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minLength: [8, 'Password must be at least 8 characters long'],
    },
    role: {
      type: String,
      enum: ['admin', 'cook', 'pending'],
      default: 'pending',
    },
    profile: {
      bio: { type: String },
      profilePhoto: { type: String, default: '' },
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);
export default User;
