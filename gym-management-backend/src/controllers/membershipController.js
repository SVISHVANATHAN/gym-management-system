import pool from "../config/db.js";
import { createMembershipSchema } from "../validators/membership.validation.js";
import { updateMembershipSchema } from "../validators/membership.validation.js";
export const getMemberships = async (req, res) => {
    try {
        const [result] = await pool.query(`
            SELECT
                ms.id,
                ms.member_id,
                m.name AS member_name,
                ms.plan_id,
                mp.name AS plan_name,
                ms.start_date,
                ms.end_date
            FROM memberships AS ms
            JOIN members AS m
                ON ms.member_id = m.id
            JOIN membership_plans AS mp
                ON ms.plan_id = mp.id
        `);

        res.status(200).json({
            success: true,
            message: "Memberships fetched successfully",
            data: result
        });
    } catch (err) {
        console.error("getMembership error:", err);

        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
export const getMembershipById = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            "SELECT * FROM memberships WHERE id = ?",
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Membership not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Membership fetched successfully",
            data: result[0]
        });
    } catch (err) {
        console.error("getMembershipById error:", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};



export const createMembership = async (req, res) => {
    try {
        const validation = createMembershipSchema.safeParse(req.body);
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

        const { member_id, plan_id, start_date } = validation.data;

        const [memberRows] = await pool.query(
            "SELECT id FROM members WHERE id = ?",
            [member_id]
        );

        if (memberRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        const [planRows] = await pool.query(
            "SELECT duration_months FROM membership_plans WHERE id = ?",
            [plan_id]
        );

        if (planRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Membership plan not found"
            });
        }

        const { duration_months } = planRows[0];

        const [result] = await pool.query(
            `INSERT INTO memberships (member_id, plan_id, start_date, end_date)
             VALUES (?, ?, ?, DATE_ADD(?, INTERVAL ? MONTH))`,
            [member_id, plan_id, start_date, start_date, duration_months]
        );

        res.status(201).json({
            success: true,
            message: "Membership created successfully",
            data: { id: result.insertId, member_id, plan_id, start_date }
        });
    } catch (err) {
        console.error("createMembership error:", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};



export const updateMembership = async (req, res) => {
    try {
        const { id } = req.params;

        const validation = updateMembershipSchema.safeParse(req.body);

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

        const { member_id, plan_id, start_date, status } = validation.data;

        const [memberRows] = await pool.query(
            "SELECT id FROM members WHERE id = ?",
            [member_id]
        );

        if (memberRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        const [planRows] = await pool.query(
            "SELECT duration_months FROM membership_plans WHERE id = ?",
            [plan_id]
        );

        if (planRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Membership plan not found"
            });
        }

        const { duration_months } = planRows[0];

        const [result] = await pool.query(
            `UPDATE memberships
             SET member_id = ?,
                 plan_id = ?,
                 start_date = ?,
                 end_date = DATE_ADD(?, INTERVAL ? MONTH),
                 status = ?
             WHERE id = ?`,
            [member_id, plan_id, start_date, start_date, duration_months, status ?? "active", id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Membership not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Membership updated successfully"
        });
    } catch (err) {
        console.error("updateMembership error:", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
export const deleteMembership = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            "DELETE FROM memberships WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Membership not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Membership deleted successfully"
        });
    } catch (err) {
        console.error("deleteMembership error:", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};