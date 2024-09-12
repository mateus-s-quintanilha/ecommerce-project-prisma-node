import { HttpException } from "./root";

export class UnauthorizedException extends HttpException {
    constructor(message: string, errorCode: number, error?: any) {
        super(message, 401, errorCode, error);
    };
};