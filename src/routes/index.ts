import { Router } from "express";
import authRoutes from "./auth";
import productsRoutes from "./products";
import usersRouter from "./users";
import cartRoutes from "./cart";
import ordersRoutes from "./orders";

const rootRoutes: Router = Router();

rootRoutes.use('/auth', authRoutes);
rootRoutes.use('/products', productsRoutes);
rootRoutes.use('/users', usersRouter);
rootRoutes.use('/cart', cartRoutes);
rootRoutes.use('/orders', ordersRoutes);

export default rootRoutes;