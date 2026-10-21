import pool from "../config/db.js";
import {createMembershipPlanSchema} from "../validators/membershipplan.validation.js"


export const getMembershipPlan = async (req, res) => {
    try {
        const [result] = await pool.query("SELECT * FROM membership_plans");

        res.status(200).json({
            success: true,
            message: "Membership plans fetched successfully",
            data: result
        });
    } catch (err) {
        console.error("getMembershipPlan error:", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

export const getMembershipPlanById = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            "SELECT * FROM membership_plans WHERE id = ?",
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Membership plan not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Membership plan fetched successfully",
            data: result[0]
        });
    } catch (err) {
        console.error("getMembershipPlanById error:", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
export const createMembershipPlan = async (req, res) => {
    try {
        const validation = createMembershipPlanSchema.safeParse(req.body);

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

        const { name, duration_months, price, description } = validation.data;

        const [result] = await pool.query(
            "INSERT INTO membership_plans (name, duration_months, price, description) VALUES (?, ?, ?, ?)",
            [name, duration_months, price, description ?? null]
        );

        res.status(201).json({
            success: true,
            message: "Membership plan created successfully",
            data: { id: result.insertId, name, duration_months, price, description }
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Membership plan already exists"
            });
        }

        console.error("createMembershipPlan error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
export const updateMembershipPlan = async (req, res) => {
    try {
        const { id } = req.params;

        const validation = createMembershipPlanSchema.safeParse(req.body);

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

        const { name, duration_months, price, description } = validation.data;

        const [result] = await pool.query(
            `UPDATE membership_plans
             SET name = ?, duration_months = ?, price = ?, description = ?
             WHERE id = ?`,
            [name, duration_months, price, description ?? null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Membership plan not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Membership plan updated successfully"
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Membership plan already exists"
            });
        }

        console.error("updateMembershipPlan error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
export const deleteMembershipPlan = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            "DELETE FROM membership_plans WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Membership plan not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Membership plan deleted successfully"
        });
    } catch (error) {
        console.error("deleteMembershipPlan error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};