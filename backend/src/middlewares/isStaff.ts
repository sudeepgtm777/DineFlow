import User from '../models/user.model';

const isStaff = async (req, res, next) => {
  try {
    const user = await User.findById(req.id);

    if (!user || !['admin', 'cook'].includes(user.role)) {
      return res.status(403).json({
        message: 'Access denied: Staff only',
        success: false,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Staff check error:', error);
    return res.status(500).json({
      message: 'Server error',
      success: false,
    });
  }
};

export default isStaff;
