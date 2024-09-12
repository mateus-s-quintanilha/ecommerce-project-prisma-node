import { Request, Response } from "express";
import { AddressSchema, ChangeUserRoleSchema, UpdateUserSchema } from "../schema/users";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { prismaClient } from "..";
import { Address, Role, User } from "@prisma/client";
import { BadRequestsException } from "../exceptions/bad-requests";


export const addAddress = async (req: Request, res: Response) => {
    AddressSchema.parse(req.body);

    const address = await prismaClient.address.create({
        data: {
            ...req.body,
            userId: req.user?.id
        }
    });

    res.json({
        address,
        user: req.user
    });
};

export const deleteAddress = async (req: Request, res: Response) => {
    try {
        await prismaClient.address.delete({
            where: { id: parseInt(req.params.id) }
        });

        res.json({
            message: 'Address delete successfully' 
        });
    } catch (error) {
        throw new NotFoundException('Address not found', ErrorCode.ADDRESS_NOT_FOUND);
    };
};

export const listAddressses = async (req: Request, res: Response) => {
    const addresses = await prismaClient.address.findMany({
        where: { userId: req.user?.id }
    });

    res.json(addresses);
};

export const updateUser = async (req: Request, res: Response) => {
    const validatedData = UpdateUserSchema.parse(req.body);
    let shippingAddress: Address;
    let billingAddress: Address;
    
    if(validatedData.defaultShippingAddress) {
        try {
            shippingAddress = await prismaClient.address.findFirstOrThrow({
                where: { id: validatedData.defaultShippingAddress }
            });
        } catch (error) {
            throw new NotFoundException('Address not found', ErrorCode.ADDRESS_NOT_FOUND);
        };
        
        if(shippingAddress.userId !== req.user?.id) {
            throw new BadRequestsException('Address does not belong to user', ErrorCode.ADDRESS_DOES_NOT_BELONG);
        };
    };

    if(validatedData.defaultBillingAddress) {
        try {
            billingAddress = await prismaClient.address.findFirstOrThrow({
                where: { id: validatedData.defaultBillingAddress }
            });
        } catch (error) {
            throw new NotFoundException('Address not found', ErrorCode.ADDRESS_NOT_FOUND);
        };

        if(billingAddress.userId !== req.user?.id) {
            throw new BadRequestsException('Address does not belong to user', ErrorCode.ADDRESS_DOES_NOT_BELONG);
        };
    };

    const updatedUser = await prismaClient.user.update({
        where: { id: req.user?.id },
        data: validatedData
    });

    return res.json(updatedUser);
};



export const listUsers = async (req: Request, res: Response) => {
    const users: User[] = await prismaClient.user.findMany({
        skip: parseInt(req.query.skip as string) || 0,
        take: 5
    });
    
    return res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
    let user: User;
    try {
        user = await prismaClient.user.findFirstOrThrow({
            where: { id: parseInt(req.params.id) },
            include: { addressses: true }
        });
    } catch (error) {
        throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND);
    };

    return res.json(user);
};

export const changeUserRole = async (req: Request, res: Response) => {
    ChangeUserRoleSchema.parse(req.body);

    let updatedUser: User;
    try {
        updatedUser = await prismaClient.user.update({
            where: { id: parseInt(req.params.id) },
            data: {
                role: req.body.role
            }
        });
    } catch (error) {
        throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND);
    };

    return res.json(updatedUser);
};