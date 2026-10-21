import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        if (!authHeader.startsWith("Bearer")) {
            return res.status(401).json({
                success: false,
                message: "Invalid token format"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.admin = decoded;
        next();

    } catch (err) {
        console.error(err);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};