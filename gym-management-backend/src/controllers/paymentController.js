import pool from "../config/db.js";
import { createPaymentSchema, updatePaymentSchema } from "../validators/payment.validation.js";

export const getPayments = async (req, res) => {
    try {
        const [result] = await pool.query(`
            SELECT
                p.id,
                p.membership_id,
                m.name AS member_name,
                mp.name AS plan_name,
                p.amount,
                p.payment_date,
                p.payment_method,
                p.payment_status,
                p.transaction_id,
                p.notes
            FROM payments AS p
            JOIN memberships AS ms
                ON p.membership_id = ms.id
            JOIN members AS m
                ON ms.member_id = m.id
            JOIN membership_plans AS mp
                ON ms.plan_id = mp.id
            ORDER BY p.id DESC
        `);

        res.status(200).json({
            success: true,
            message: "Payments fetched successfully",
            data: result
        });
    } catch (err) {
        console.error("getPayments error:", err);

        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            "SELECT * FROM payments WHERE id = ?",
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment fetched successfully",
            data: result[0]
        });
    } catch (err) {
        console.error("getPaymentById error:", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

export const createPayment = async (req, res) => {
    try {
        const validation = createPaymentSchema.safeParse(req.body);

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
            membership_id,
            amount,
            payment_date,
            payment_method,
            payment_status,
            transaction_id,
            notes
        } = validation.data;

        const [membershipRows] = await pool.query(
            "SELECT id FROM memberships WHERE id = ?",
            [membership_id]
        );

        if (membershipRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Membership not found"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO payments
             (membership_id, amount, payment_date, payment_method, payment_status, transaction_id, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                membership_id,
                amount,
                payment_date,
                payment_method,
                payment_status ?? "paid",
                transaction_id ?? null,
                notes ?? null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Payment recorded successfully",
            data: {
                id: result.insertId,
                membership_id,
                amount,
                payment_date,
                payment_method,
                payment_status: payment_status ?? "paid",
                transaction_id,
                notes
            }
        });
    } catch (err) {
        console.error("createPayment error:", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};


export const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;

        const validation = updatePaymentSchema.safeParse(req.body);

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
            membership_id,
            amount,
            payment_date,
            payment_method,
            payment_status,
            transaction_id,
            notes
        } = validation.data;

        const [membershipRows] = await pool.query(
            "SELECT id FROM memberships WHERE id = ?",
            [membership_id]
        );

        if (membershipRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Membership not found"
            });
        }

        const [result] = await pool.query(
            `UPDATE payments
             SET membership_id = ?,
                 amount = ?,
                 payment_date = ?,
                 payment_method = ?,
                 payment_status = ?,
                 transaction_id = ?,
                 notes = ?
             WHERE id = ?`,
            [
                membership_id,
                amount,
                payment_date,
                payment_method,
                payment_status ?? "paid",
                transaction_id ?? null,
                notes ?? null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment updated successfully"
        });
    } catch (err) {
        console.error("updatePayment error:", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};


export const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            "DELETE FROM payments WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment deleted successfully"
        });
    } catch (err) {
        console.error("deletePayment error:", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};