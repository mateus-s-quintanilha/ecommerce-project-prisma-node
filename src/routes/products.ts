import { Router } from "express";
import { createProducts, deleteProduct, getProductById, listProducts, searchProducts, updateProduct } from "../controllers/products";
import { errorHandler } from "../error-handler";
import authMiddleware from "../middlewares/auth";
import adminMiddleware from "../middlewares/admin";

const productsRoutes = Router();

productsRoutes.post('/', [ authMiddleware, adminMiddleware ], errorHandler(createProducts));
productsRoutes.get('/', [ authMiddleware ], errorHandler(listProducts));
productsRoutes.get('/search', [ authMiddleware ], errorHandler(searchProducts));
productsRoutes.get('/:id', [ authMiddleware ], errorHandler(getProductById));
productsRoutes.put('/:id', [ authMiddleware, adminMiddleware ], errorHandler(updateProduct));
productsRoutes.delete('/:id', [ authMiddleware, adminMiddleware ], errorHandler(deleteProduct))

export default productsRoutes;