import { Request, Response } from "express";
import { prismaClient } from "..";
import { createProductSchema } from "../schema/products";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";

export const createProducts = async (req: Request, res: Response) => {
    createProductSchema.parse(req.body)
    const product = await prismaClient.product.create({
        data: {
            ...req.body,
            tags: req.body.tags.join(',')
        }
    });

    return res.json(product);
};


export const listProducts = async (req: Request, res: Response) => {
    const count = await prismaClient.product.count();
    
    const products = await prismaClient.product.findMany({
        skip: req.query?.skip ? parseInt(req.query?.skip as string) : 0,
        take: 5 
    });
    return res.json({
        count,
        data: products
    });
};


export const getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const product = await prismaClient.product.findFirst({
        where: { id: parseInt(id) }
    });

    if(!product) {
        throw new NotFoundException('Product not found', ErrorCode.PRODUCT_NOT_FOUND);
    };

    return res.json(product);
};


export const updateProduct = async (req: Request, res: Response) => {
    try {
        const product = req.body;
        if(product.tags) {
            product.tags = product.tags.join(',');
        };
    
        const updatedProduct = await prismaClient.product.update({
            where: { id: parseInt(req.params.id) },
            data: product 
        });

        return res.json(updatedProduct);
    } catch (error) {
        throw new NotFoundException('Product not found', ErrorCode.PRODUCT_NOT_FOUND); 
    };
};


export const deleteProduct = async (req: Request, res: Response) => {
    try {
        await prismaClient.product.delete({
            where: { id: parseInt(req.params.id) }
        });
    
        return res.json({ 
            message: 'Product was deleted successfully'
        });
    } catch (error) {
        throw new NotFoundException('Product not found', ErrorCode.PRODUCT_NOT_FOUND);
    };
};


export const searchProducts = async (req: Request, res: Response) => {
    const products = await prismaClient.product.findMany({
        where: {
            name: {
                search: req.query.q?.toString()
            },
            description: {
                search: req.query.q?.toString()
            },
            tags: {
                search: req.query.q?.toString()
            },
        },
        skip: parseInt(req.query.skip as string) || 0,
        take: 5
    });

    return res.json(products);
};