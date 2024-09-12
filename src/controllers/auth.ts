import { NextFunction, Request, Response } from 'express'
import { prismaClient } from '..';
import { hashSync, compareSync } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../secrets';
import { BadRequestsException } from '../exceptions/bad-requests';
import { ErrorCode } from '../exceptions/root';
import { SignUpSchema } from '../schema/users';
import { NotFoundException } from '../exceptions/not-found';

export const signup = async (req: Request, res: Response) => { 
    const { email, password, name } = req.body;

    SignUpSchema.parse(req.body);
    let user = await prismaClient.user.findFirst({
        where: { email: email }
    });

    if(user) {
        throw new BadRequestsException('User already exists', ErrorCode.USER_ALREADY_EXISTS)
    };

    user = await prismaClient.user.create({
        data: { email, name, password: hashSync(password, 10) }
    });
    
    return res.json({
        message: "user successfully created",
        data: user
    });
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    let user = await prismaClient.user.findFirst({ 
        where: { email: email } 
    });

    if(!user) {
        throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND)
    };

    if(!compareSync(password, user.password)) {
        throw new BadRequestsException('Incorrect password', ErrorCode.INCORRECT_PASSWORD);
    };

    const token = jwt.sign({
        userId: user.id
    }, JWT_SECRET as jwt.Secret);

    return res.json({
        user, 
        token,
        token_payload: jwt.verify(token, JWT_SECRET as string)
    });
};

export const me = async (req: Request, res: Response) => {
    return res.json(req.user);
};