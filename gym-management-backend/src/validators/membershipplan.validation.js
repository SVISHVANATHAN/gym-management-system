import { z } from "zod";
export const createMembershipPlanSchema = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .trim()
        .min(3, "Name must be at least 3 characters"),

    duration_months: z.coerce
        .number({ required_error: "Duration is required" })
        .refine((val) => [1, 3, 6, 9, 12].includes(val), {
            message: "Duration must be 1, 3, 6, or 12 months",
        }),

    price: z.coerce
        .number({ required_error: "Price is required" })
        .positive("Price must be greater than 0"),

    description: z.string().trim().optional(),
});