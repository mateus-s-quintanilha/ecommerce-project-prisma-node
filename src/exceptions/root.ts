
export class HttpException extends Error {
    message: string;
    statusCode: number;
    errorCode: ErrorCode;
    errors: any;

    constructor(message: string, statusCode: number, errorCode: ErrorCode, errors: any) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.errors = errors;
    };
};

export enum ErrorCode {
    USER_NOT_FOUND = 1001,
    USER_ALREADY_EXISTS = 1002,
    INCORRECT_PASSWORD = 1003,
    ADDRESS_NOT_FOUND = 1004,
    ADDRESS_DOES_NOT_BELONG = 1005,
    UNPROCESSABLE_ENTITY = 2001,
    INTERNAL_EXCEPTION =  3001,
    UNAUTHORIZED = 4001,
    PRODUCT_NOT_FOUND = 5001,
    CART_ITEM_NOT_FOUND = 6001,
    CART_ITEM_DOES_NOT_BELONG = 6002,
    ORDER_NOT_FOUND = 7001
};