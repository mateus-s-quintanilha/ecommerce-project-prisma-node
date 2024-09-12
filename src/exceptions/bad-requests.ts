import { ErrorCode, HttpException } from "./root";

export class BadRequestsException extends HttpException {
    constructor(message: string, errorCode: ErrorCode, error?: any) {
        super(message, 400, errorCode, error);
    };
};