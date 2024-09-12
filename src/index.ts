import express, { Express } from 'express';
import { SERVER_PORT } from './secrets'
import rootRoutes from './routes';
import { Address, PrismaClient } from '@prisma/client';
import { errorMiddleware } from './middlewares/errors';
import { SignUpSchema } from './schema/users';

const app: Express = express();

// configure middleware
app.use(express.json());

app.use('/api', rootRoutes);

export const prismaClient = new PrismaClient({
    log: ['query']
})
.$extends({
    result: {
        address: {
            formattedAddress: {
                needs: {
                    lineOne: true,
                    lineTwo: true,
                    city: true,
                    country: true,
                    pincode: true
                },
                compute: (addr: Address) => {
                    return `${addr.lineOne}, ${addr.lineTwo}, ${addr.city}, ${addr.country} -${addr.pincode}`
                }
            }
        }
    }
});

// configure error middleware
app.use(errorMiddleware);


app.listen(SERVER_PORT, () => console.log(`Server's now running on port ${SERVER_PORT}`));