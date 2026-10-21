import { z } from "zod";

export const createMembershipSchema = z.object({
    member_id: z
        .coerce.number({ required_error: "member_id is required" })
        .int()
        .positive("member_id must be a positive number"),

    plan_id: z
        .coerce.number({ required_error: "plan_id is required" })
        .int()
        .positive("plan_id must be a positive number"),

    start_date: z
        .string({ required_error: "start_date is required" })
        .regex(/^\d{4}-\d{2}-\d{2}$/, "start_date must be in YYYY-MM-DD format"),
});
export const updateMembershipSchema = z.object({
    member_id: z
        .coerce.number({ required_error: "member_id is required" })
        .int()
        .positive("member_id must be a positive number"),

    plan_id: z
        .coerce.number({ required_error: "plan_id is required" })
        .int()
        .positive("plan_id must be a positive number"),

    start_date: z
        .string({ required_error: "start_date is required" })
        .regex(/^\d{4}-\d{2}-\d{2}$/, "start_date must be in YYYY-MM-DD format"),

    status: z
        .enum(["active", "expired", "cancelled"], {
            errorMap: () => ({ message: "status must be active, expired, or cancelled" }),
        })
        .optional(),
});