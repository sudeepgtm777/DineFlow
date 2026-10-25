import User from '../models/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import getDataUri from '../utils/datauri';
import cloudinary from '../utils/cloudinary';
import { authCookieOptions } from '../utils/cookieOptions';

export const register = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User already exists', success: false });
    }

    if (!req.body.password || String(req.body.password).length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters',
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const userName = req.body.fullname || 'User';
    let profilePhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff&size=150`;
    if (req.file) {
      try {
        const fileUri = getDataUri(req.file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        profilePhoto = cloudResponse.secure_url;
      } catch (cloudError) {
        console.log(
          'Cloudinary error, using default photo:',
          cloudError.message,
        );
      }
    }

    await User.create({
      fullname: req.body.fullname,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      password: hashedPassword,
      role: 'pending',
      profile: { profilePhoto },
    });

    return res.status(201).json({
      message: 'You have requested to be Cook. Check later.',
      success: true,
    });
  } catch (error) {
    console.error('Error in register function:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors,
        success: false,
      });
    }
    return res
      .status(500)
      .json({ message: 'Internal Server Error', success: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Something is missing',
        success: false,
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Incorrect email or password.',
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: 'Incorrect email or password.',
        success: false,
      });
    }

    const tokenData = {
      userId: user._id,
      role: user.role, // Include the role in the token payload
    };
    const token = await jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    const publicUser = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profile: user.profile,
      role: user.role,
    };

    return res
      .status(200)
      .cookie('token', token, authCookieOptions())
      .json({
        message: `Welcome back ${publicUser.fullname}`,
        user: publicUser,
        success: true,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Something went wrong',
      success: false,
    });
  }
};

export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie('token', '', { ...authCookieOptions(0), maxAge: 0 })
      .json({
        message: 'Logged out successfully.',
        success: true,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Something went wrong',
      success: false,
    });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { fullname, phoneNumber, password, bio } = req.body;
    let user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: 'User not found.',
        success: false,
      });
    }

    if (fullname) user.fullname = fullname;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;

    if (password) {
      if (String(password).length < 8) {
        return res.status(400).json({
          message: 'Password must be at least 8 characters',
          success: false,
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    const file = req.file;
    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

      // Delete old profile picture from Cloudinary if it exists
      if (user.profile.profilePhoto) {
        const oldImagePublicId = user.profile.profilePhoto
          .split('/')
          .pop()
          .split('.')[0];
        await cloudinary.uploader.destroy(oldImagePublicId);
      }

      user.profile.profilePhoto = cloudResponse.secure_url;
    }

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profile: user.profile,
      },
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Internal server error.',
      success: false,
    });
  }
};

export const checkLoginStatus = async (req, res) => {
  try {
    const bearer = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    const token = req.cookies?.token || bearer;
    if (!token) {
      return res.status(200).json({ success: false, user: null });
    }

    let userId: string | undefined;
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload & {
        userId?: string;
      };
      userId = decode?.userId;
    } catch {
      return res.status(200).json({ success: false, user: null });
    }

    if (!userId) {
      return res.status(200).json({ success: false, user: null });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(200).json({ success: false, user: null });
    }

    return res.status(200).json({
      message: 'User is logged in',
      user,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ success: false, user: null });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return res.status(200).json({ users, success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal server error', success: false });
  }
};

export const promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: 'User not found', success: false });
    }
    if (user.role !== 'cook') {
      return res.status(400).json({
        message: 'Only approved cooks can be promoted to admin',
        success: false,
      });
    }
    user.role = 'admin';
    await user.save();
    return res.status(200).json({
      message: `${user.fullname} promoted to admin successfully`,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal server error', success: false });
  }
};

export const demoteFromAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.id && String(req.id) === String(userId)) {
      return res.status(400).json({
        message: 'You cannot demote yourself',
        success: false,
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: 'User not found', success: false });
    }
    if (user.role !== 'admin') {
      return res.status(400).json({
        message: 'User is not an admin',
        success: false,
      });
    }
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return res.status(400).json({
        message: 'Cannot demote the last admin',
        success: false,
      });
    }
    user.role = 'cook';
    await user.save();
    return res.status(200).json({
      message: `${user.fullname} demoted to cook successfully`,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal server error', success: false });
  }
};

export const approveCook = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: 'User not found', success: false });
    }
    if (user.role !== 'pending') {
      return res.status(400).json({
        message: 'User does not have a pending cook request',
        success: false,
      });
    }
    user.role = 'cook';
    await user.save();
    return res.status(200).json({
      message: `${user.fullname} approved as cook`,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal server error', success: false });
  }
};

export const rejectCook = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: 'User not found', success: false });
    }
    if (user.role !== 'pending') {
      return res.status(400).json({
        message: 'User does not have a pending cook request',
        success: false,
      });
    }
    await User.findByIdAndDelete(userId);
    return res.status(200).json({
      message: `${user.fullname}'s cook request was rejected`,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal server error', success: false });
  }
};
