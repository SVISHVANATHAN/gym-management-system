import { z } from "zod";
export const createPaymentSchema = z.object({
    membership_id: z
        .coerce.number({ required_error: "membership_id is required" })
        .int()
        .positive("membership_id must be a positive number"),

    amount: z
        .coerce.number({ required_error: "amount is required" })
        .positive("amount must be greater than 0"),

    payment_date: z
        .string({ required_error: "payment_date is required" })
        .regex(/^\d{4}-\d{2}-\d{2}$/, "payment_date must be in YYYY-MM-DD format"),

    payment_method: z.enum(["cash", "upi", "card", "bank_transfer"], {
        errorMap: () => ({ message: "payment_method must be cash, upi, card, or bank_transfer" }),
    }),

    payment_status: z
        .enum(["paid", "pending", "failed", "refunded"], {
            errorMap: () => ({ message: "payment_status must be paid, pending, failed, or refunded" }),
        })
        .optional(),

    transaction_id: z.string().trim().optional(),

    notes: z.string().trim().optional(),
});

export const updatePaymentSchema = createPaymentSchema;