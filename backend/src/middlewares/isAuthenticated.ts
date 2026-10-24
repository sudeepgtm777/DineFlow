import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        const bearer = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.slice(7)
            : null;
        const token = req.cookies?.token || bearer;
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload & {
          userId?: string;
        };
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
        });
    }
};

export default isAuthenticated;
