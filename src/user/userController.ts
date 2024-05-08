import express, { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import userModel from './userModel';
import bcrypt from "bcrypt"
import { sign } from 'jsonwebtoken';
import { config } from '../config/config';
import { User } from './userTypes';

const createUser = async (req: Request , res: Response , next: NextFunction) => {
    const {name , email , password} = req.body;

    //validation
    if(!name || !email || !password){
        const error = createHttpError(400 , "All fields are required");
        return next(error); // this error will be catched by global error handler
    }
    // res.json({
    //     message: " user created success "
    // })

    //database call

    try {
        const user = await userModel.findOne({email: email});
        if(user){
            const error = createHttpError(400 , "user already exists ");
            return next(error); 
        }
    } catch (error) {
        return next(createHttpError(500,"error while getting user"))
        
    }

  

    // password hash
    const hashedPassword = await bcrypt.hash(password , 10);

    // make user to put in mongo
    let newUser: User;
    try {
         newUser = await userModel.create({
            name,
            email,
            password : hashedPassword
        })
    } catch (error) {
        return next(createHttpError(500 , "error while creating new user"))
        
    }

    try {
            // token creation
    const token = sign({sub: newUser._id} , config.jwtSecret as string , {expiresIn: "7d"});


    //process
    

    // res.json({id: newUser._id});
    res.status(201).json({accessToken : token});
    } catch (error) {
        return next(createHttpError(500 , "error while signing"));
        
    }



    
};
const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return next(createHttpError(400, "All fields are required"));
    }
  
    // todo: wrap in try catch.
    const user = await userModel.findOne({ email });
    if (!user) {
        return next(createHttpError(404, "User not found."));
    }
  
    const isMatch = await bcrypt.compare(password, user.password as string);

    if (!isMatch) {
        return next(createHttpError(400, "Username or password incorrect!"));
    }

    const token = sign({sub: user._id} , config.jwtSecret as string , {expiresIn: "7d"});
    res.json({ accessToken: token });


    // const token = sign({})





   

    

};



export {createUser , 
        loginUser

};