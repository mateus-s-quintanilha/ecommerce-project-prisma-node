import { Request, Response } from "express";
import { prismaClient } from "..";
import { Address, CartItem, Order, OrderEventStatus, Product } from "@prisma/client";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { ChangeOrderStatusSchema } from "../schema/orders";

export const createOrder = async (req: Request, res: Response) => {
    return await prismaClient.$transaction(async (tx) => {
        const cartItems: (CartItem & { product: Product })[]  = await tx.cartItem.findMany({
            where: { userId: req.user?.id },
            include: {
                product: true
            }
        });

        if(!cartItems.length) {
            return res.json({
                message: 'Cart is empty'
            });
        };

        const price = cartItems.reduce((prev, curr) => {
            return prev + (curr.quantity * + curr.product.price)
        }, 0);

        if(!req.user?.defaultShippingAddress) {
            return res.json({
                message: "you have no default address"
            });
        }

        const address = await tx.address.findFirst({
            where: { id: req.user?.defaultShippingAddress as number }
        })

        const order = await tx.order.create({
            data: {
                userId: req.user?.id,
                netAmmount: price,
                address: (address?.formattedAddress as string),
                products: {
                    create: cartItems.map(cart => {
                        return {
                            productId: cart.productId,
                            quantity: cart.quantity
                        }
                    })
                }
            }
        });

        await tx.orderEvent.create({
            data: { orderId: order.id }
        });

        await tx.cartItem.deleteMany({
            where: { userId: req.user?.id }
        });

        return res.json(order);
    });
};

export const listOrders = async (req: Request, res: Response) => {
    const orders: Order[] = await prismaClient.order.findMany({
        where: { userId: req.user?.id }
    });

    if(!orders.length) {
        return res.json({
            message: 'There are no orders'
        });
    };

    return res.json(orders);
};

export const cancelOrder = async (req: Request, res: Response) => {
    return await prismaClient.$transaction(async (tx) => {
        try {
            const order: Order = await tx.order.update({
                where: { 
                    id: parseInt(req.params.id), 
                    userId: req.user?.id
                },
                data: { status: "CANCELED" }
            }); 
    
            await tx.orderEvent.create({
                data: { 
                    orderId: order.id,
                    status: "CANCELED"
                }
            });
        } catch (error) {
            throw new NotFoundException('Order not found', ErrorCode.ORDER_NOT_FOUND);
        };

        return res.json({
            message: 'Order successfully canceled'
        });
    });
};

export const getOrderById = async (req: Request, res: Response) => {
    let order: Order;
    try {
        order = await prismaClient.order.findFirstOrThrow({
            where: { 
                id: parseInt(req.params.id), 
                userId: req.user?.id
            },
            include: { 
                products: true,
                events: true
            }
        });
    } catch (error) {
        throw new NotFoundException('Order not found', ErrorCode.ORDER_NOT_FOUND);
    };

    return res.json(order);
};


export const listAllOrders = async (req: Request, res: Response) => {
    let whereClause: Object = {};
    if(req.query.status) {
        whereClause = {
            status: req.query.status
        };
    };

    const orders: Order[] = await prismaClient.order.findMany({
        where: whereClause,
        skip: parseInt(req.query.skip as string) || 0,
        take: 5
    });
    
    return res.json(orders);
};

export const changeStatus = async (req: Request, res: Response) => {
    const validatedData = ChangeOrderStatusSchema.parse(req.body);

    return await prismaClient.$transaction(async (tx) => {
        try {
            const changedOrder: Order = await tx.order.update({
                where: { id: parseInt(req.params.id) },
                data: { status: (validatedData.status as OrderEventStatus) }
            });
    
            await tx.orderEvent.create({
                data: {
                    orderId: changedOrder.id,
                    status: changedOrder.status
                }
            });
            return res.json(changedOrder);
        
        } catch (error) {
          throw new NotFoundException('Order not found', ErrorCode.ORDER_NOT_FOUND);  
        };
    });
};

export const listUserOrders = async (req: Request, res: Response) => {
    let whereClause: Object = { userId: parseInt(req.params.id) };
    if(req.body.status) {
        whereClause = {
            ...whereClause,
            status: req.body.status
        };
    };

    const userOrders: Order[] = await prismaClient.order.findMany({
        where: whereClause,
        skip: parseInt(req.query.skip as string) || 0, 
        take: 5
    });

    return res.json(userOrders);
};