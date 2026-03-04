import { z } from "zod";

export const loginZodSchema = z.object({
    email : z.email({ message: "Invalid email address" }),
    password : z.string()
    .min(1, "Password is required" )
    .min(8, "Password must be at least 6 characters long"),
})

export type ILoginPayload = z.infer<typeof loginZodSchema>;