import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import { errorHandler } from "../error-handler";
import { addItemToCart, changeQuantity, deleteItemFromCart, getCart } from "../controllers/cart";

const cartRoutes = Router();

cartRoutes.get('/', [ authMiddleware ], errorHandler(getCart));
cartRoutes.delete('/:id', [ authMiddleware ], errorHandler(deleteItemFromCart));
cartRoutes.post('/', [ authMiddleware ], errorHandler(addItemToCart));
cartRoutes.put('/:id', [ authMiddleware ], errorHandler(changeQuantity));

export default cartRoutes;