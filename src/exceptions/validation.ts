import { HttpException } from "./root";

export class UnprocessableEntity extends HttpException {
    constructor(message: string, error: any, errrorCode: number) {
        super(message, 422, errrorCode, error);
    };
};