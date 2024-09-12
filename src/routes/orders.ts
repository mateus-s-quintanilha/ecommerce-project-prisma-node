import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import { errorHandler } from "../error-handler";
import { cancelOrder, changeStatus, createOrder, getOrderById, listAllOrders, listOrders } from "../controllers/orders";
import adminMiddleware from "../middlewares/admin";

const ordersRoutes = Router();

ordersRoutes.post('/', [ authMiddleware ], errorHandler(createOrder));
ordersRoutes.get('/', [ authMiddleware ], errorHandler(listOrders));
ordersRoutes.put('/:id/cancel', [ authMiddleware ], errorHandler(cancelOrder));
ordersRoutes.get('/all', [ authMiddleware, adminMiddleware ], errorHandler(listAllOrders));
ordersRoutes.post('/:id/status', [ authMiddleware, adminMiddleware ], errorHandler(changeStatus));
ordersRoutes.get('/:id', [ authMiddleware ], errorHandler(getOrderById));

export default ordersRoutes;