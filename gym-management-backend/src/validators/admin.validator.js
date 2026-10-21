import { z } from "zod";
export const updateAdminSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters"),

    email: z
        .string()
        .trim()
        .email("Must be a valid email address")
});
export const registerAdminSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name is required")
        .min(3, "Name must be at least 3 characters"),

    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Must be a valid email address"),

    password: z
        .string()
        .trim()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters")
});
export const loginAdminSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Must be a valid email address"),

    password: z
        .string()
        .trim()
        .min(1, "Password is required")
});