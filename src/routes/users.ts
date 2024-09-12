import { Router } from "express";
import { errorHandler } from "../error-handler";
import { addAddress, changeUserRole, deleteAddress, getUserById, listAddressses, listUsers, updateUser } from "../controllers/users";
import authMiddleware from "../middlewares/auth";
import adminMiddleware from "../middlewares/admin";

const usersRouter = Router();

usersRouter.get('/address', [ authMiddleware ], errorHandler(listAddressses));
usersRouter.post('/address', [ authMiddleware ], errorHandler(addAddress));
usersRouter.delete('/address/:id', [ authMiddleware ], errorHandler(deleteAddress));
usersRouter.put('/', [ authMiddleware ], errorHandler(updateUser));

usersRouter.get('/', [ authMiddleware, adminMiddleware ], errorHandler(listUsers));
usersRouter.get('/:id', [ authMiddleware, adminMiddleware ], errorHandler(getUserById));
usersRouter.post('/:id/role', [ authMiddleware, adminMiddleware ], errorHandler(changeUserRole));

export default usersRouter;