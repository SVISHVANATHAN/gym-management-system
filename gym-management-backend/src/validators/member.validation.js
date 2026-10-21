import { z } from "zod";

export const createMemberSchema = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .trim()
        .min(3, "Name must be at least 3 characters"),

    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email("Invalid email address"),

    phone: z
        .string({ required_error: "Phone is required" })
        .regex(/^\d{10}$/, "Phone must be exactly 10 digits"),

    gender: z.enum(["male", "female", "other"], {
        error: "Gender must be male, female, or other"
    }),

    date_of_birth: z
        .string()
        .optional(),

    address: z
        .string()
        .trim()
        .optional()
});