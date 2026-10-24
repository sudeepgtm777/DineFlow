import User from '../models/user.model';

const isAdmin = async (req, res, next) => {
  try {
    // Fetch user from the database using the ID from the token
    const user = await User.findById(req.id);

    // Check if the user exists and is an admin
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied: Admins only',
        success: false,
      });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      message: 'Server error',
      success: false,
    });
  }
};
export default isAdmin;
