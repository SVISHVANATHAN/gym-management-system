import pool from "../config/db.js";
import {updateAdminSchema } from "../validators/admin.validator.js"
export const getAdmin = async (req, res) => {
    try {
        const [result] = await pool.query("SELECT * FROM admins");

        res.status(200).json({
            success: true,
            message: "Get Admin successfully",
            data: result
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
export const getElementById = async (req, res) => {
    try {
        const id = req.params.id;
        const [result] = await pool.query(
            "SELECT id, name, email, created_at FROM admins WHERE id = ?",
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Get Admin successfully",
            data: result
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
export const deleteAdmin = async (req, res) => {
    try {
        const id = req.params.id;
        const [result] = await pool.query("DELETE FROM admins WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Admin deleted successfully"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
export const updateAdmin = async (req, res) => {
    try {
        const id = req.params.id;

        const result = updateAdminSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.issues.map(err => ({
                    field: err.path.join("."),
                    message: err.message
                }))
            });
        }

        const { name, email } = result.data;

        const [dbResult] = await pool.query(
            "UPDATE admins SET name = ?, email = ? WHERE id = ?",
            [name, email, id]
        );

        if (dbResult.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Admin updated successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};