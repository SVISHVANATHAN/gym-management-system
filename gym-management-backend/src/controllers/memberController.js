import pool from "../config/db.js";
import { createMemberSchema } from "../validators/member.validation.js";
export const getMembers = async (req, res) => {
    try {
        const [result] = await pool.query("SELECT * FROM members");

        res.status(200).json({
            success: true,
            message: "Members retrieved successfully",
            data: result
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
export const getMemberById = async (req, res) => {
    try {
        const id = req.params.id;

        const [result] = await pool.query(
            "SELECT * FROM members WHERE id = ?",
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Member retrieved successfully",
            data: result[0]
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
export const createMember = async (req, res) => {
    try {
        const validation = createMemberSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.issues.map((issue) => ({
                    field: issue.path[0],
                    message: issue.message,
                })),
            });
        }
        const {
            name,
            email,
            phone,
            gender,
            date_of_birth,
            address
        } = validation.data;

        const [result] = await pool.query(
            `INSERT INTO members
            (name, email, phone, gender, date_of_birth, address)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                name,
                email,
                phone,
                gender,
                date_of_birth ?? null,
                address ?? null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Member created successfully",
            data: {
                id: result.insertId,
                name,
                email,
                phone,
                gender,
                date_of_birth,
                address
            }
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        console.error("createMember error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
export const updateMember = async (req, res) => {
    try {
        const { id } = req.params;

        const validation = createMemberSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.issues.map((issue) => ({
                    field: issue.path[0],
                    message: issue.message,
                })),
            });
        }

        const { name, email, phone, gender, date_of_birth, address } = validation.data;

        const [result] = await pool.query(
            `UPDATE members
             SET name = ?, email = ?, phone = ?, gender = ?, date_of_birth = ?, address = ?
             WHERE id = ?`,
             [name, email, phone, gender, date_of_birth ?? null, address ?? null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Member not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Member updated successfully",
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        console.error("updateMember error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};
export const deleteMember = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            "DELETE FROM members WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Member deleted successfully"
        });

    } catch (error) {
        console.error("deleteMember error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};