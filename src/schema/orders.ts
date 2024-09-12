import { OrderEventStatus } from "@prisma/client";
import { z } from "zod";

const OrderStatus = Object.values(OrderEventStatus)
export const ChangeOrderStatusSchema = z.object({
    status: z.enum(
        [...OrderStatus as [string, ...string[]]]
    )
});