import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string(),
    description: z.string().min(15).max(200),
    price: z.number(),
    tags: z.array(z.string()).min(1).max(20)
})