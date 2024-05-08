import express, { NextFunction, Request, Response } from  'express';
import createHttpError, { HttpError } from 'http-errors'; // for display of error
import globalErrorHandler from './middlewares/globalErrorHandler';
import userRouter from './user/userRouter';
import bookRouter from './book/bookRouter';
import cors from 'cors'
import { config } from './config/config';
const app = express();

app.use(cors({ // CROSS ORIGIN RESOURCE SHARING // client on diff domain server on diff domain
    origin: config.frontendDomain
}))

app.use(express.json()); // parse incoming post requests with json payloads and return any response


app.get('/' , (req , res , next) => {

    const error = createHttpError(400 , "Something went wrong");
    throw error;

    res.json({
        message: "Welcome to elib labs"
    })

});



app.use('/api/users' , userRouter);
app.use('/api/books' , bookRouter);



//global error handler (after all routes)
// when route handler gets error it gets tranfered to global error handler
// app.use((err : HttpError , req: Request , res: Response , next: NextFunction) => {
//     const statusCode = err.statusCode || 500;

//     return res.status(statusCode).json({
//         message: err.message,
//         errorStack: config.env === 'development' ? err.stack : ""
//     })


// })
app.use(globalErrorHandler);

export default app;
 