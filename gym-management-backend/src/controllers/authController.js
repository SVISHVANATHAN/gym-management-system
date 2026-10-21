import { z } from "zod";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import {registerAdminSchema,loginAdminSchema} from "../validators/admin.validator.js"
import jwt from "jsonwebtoken";
export const registerAdmin = async (req, res) => {
    try {
        const result = registerAdminSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.issues.map((err) => ({
                    field: err.path.join("."),
                    message: err.message
                }))
            });
        }

        const { name, email, password } = result.data;

        const hashedPassword = await bcrypt.hash(password, 10);

        const [Result] = await pool.query(
            "INSERT INTO admins (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );

        console.log({ Result });

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            data: {
                id: Result.insertId,
                name,
                email
            }
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
export const loginAdmin = async (req, res) => {
    try {
        const result = loginAdminSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.issues.map(err => ({
                    field: err.path.join("."),
                    message: err.message
                }))
            });
        }

        const { email, password } = result.data;

        const [rows] = await pool.query(
            "SELECT id, name, email, password FROM admins WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const admin = rows[0];

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: admin.id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: {
                id: admin.id,
                name: admin.name,
                email: admin.email
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};