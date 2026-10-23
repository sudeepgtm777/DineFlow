// @ts-nocheck
import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.id = decode?.userId;
        
        if (!req.id) {
            return res.status(401).json({
                message: "Invalid token",
                success: false
            });
        }

        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({
            message: "Authentication failed",
            success: false,
            error: error.message,
        });
    }
};

export default isAuthenticated;
