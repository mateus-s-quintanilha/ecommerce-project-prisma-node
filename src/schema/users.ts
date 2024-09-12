import { Role } from "@prisma/client";
import { z } from "zod";

export const SignUpSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8)
});

export const AddressSchema = z.object({
    lineOne: z.string(),
    lineTwo: z.string().nullable(),
    pincode: z.string().length(6),
    country: z.string(),
    city: z.string()
});

export const UpdateUserSchema = z.object({
    name: z.string().optional(),
    defaultShippingAddress: z.number().optional(),
    defaultBillingAddress: z.number().optional() 
});

const userRoles: string[] = Object.values(Role);
export const ChangeUserRoleSchema = z.object({
    role: z.enum(
        userRoles as [string, ...string[]]
    )
});