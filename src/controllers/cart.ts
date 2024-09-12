import { Request, Response } from "express";
import { ChangeQuantitySchema, CreateCartSchema } from "../schema/cart";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { CartItem, Product } from "@prisma/client";
import { prismaClient } from "..";
import { UnauthorizedException } from "../exceptions/unauthorized";

export const getCart = async (req: Request, res: Response) => {
    const cartItems: CartItem[] = await prismaClient.cartItem.findMany({
        where: { userId: req.user?.id }
    });

    return res.json(cartItems);
};

export const deleteItemFromCart = async (req: Request, res: Response) => {
    let cartItemToDelete: CartItem;
    try {
        cartItemToDelete = await prismaClient.cartItem.findFirstOrThrow({
            where: { id: parseInt(req.params.id) }
        });
    } catch (error) {
        throw new NotFoundException('Cart item not found', ErrorCode.CART_ITEM_NOT_FOUND);
    };

    // checks if cart bellongs to the user
    if(cartItemToDelete.userId != req.user?.id) {
        throw new UnauthorizedException('Cart does not belong to user', ErrorCode.CART_ITEM_DOES_NOT_BELONG);
    };

    await prismaClient.cartItem.delete({
        where: { id: cartItemToDelete.id }
    });
    
    res.json({
        success: true,
        message: 'Item was successfully deleted from cart'
    });
};

export const addItemToCart = async(req: Request, res: Response) => {
    const validatedData = CreateCartSchema.parse(req.body);
    
    let product: Product;
    try {
        product = await prismaClient.product.findFirstOrThrow({
            where: { id: validatedData.productId }
        });
    } catch (error) {
        throw new NotFoundException('Cart item not found', ErrorCode.CART_ITEM_NOT_FOUND);
    };

    // check if product already exists in the cart
    const cartProductAlreadyExists = await prismaClient.cartItem.findFirst({
        where: { productId: product.id }
    });

    // if product already exists, we update the existing one's quantity
    let cart: CartItem;
    if(cartProductAlreadyExists) {
        cart = await prismaClient.cartItem.update({
            where: { id: cartProductAlreadyExists.id },
            data: { quantity: cartProductAlreadyExists.quantity + validatedData.quantity }
        });
    } else {
        cart = await prismaClient.cartItem.create({
            data: { 
                userId: req.user?.id as number,
                productId: product.id,
                quantity: validatedData.quantity
            }
        });
    };

    res.json(cart);
};

export const changeQuantity = async(req: Request, res: Response) => {
    const validatedData = ChangeQuantitySchema.parse(req.body);

    // checks if cart item exists
    let cartToUpdate: CartItem;
    try {
        cartToUpdate = await prismaClient.cartItem.findFirstOrThrow({
            where: { id: parseInt(req.params.id) }
        });
    } catch (error) {
        throw new NotFoundException('Cart item not found', ErrorCode.CART_ITEM_NOT_FOUND)
    }

    // checks if cart item belongs to the user
    if(cartToUpdate.userId != req.user?.id) {
        throw new UnauthorizedException('Cart does not belong to user', ErrorCode.CART_ITEM_DOES_NOT_BELONG);
    };


    const updatedCart = await prismaClient.cartItem.update({
        where: { id: cartToUpdate.id },
        data: { 
            quantity: validatedData.quantity
        }
    });

    res.json(updatedCart);
};


