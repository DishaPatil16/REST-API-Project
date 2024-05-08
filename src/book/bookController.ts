import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path"
import fs from "node:fs"
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import { AuthRequest } from "../middlewares/authenticate";
import mongoose from "mongoose";

const createBook = async (req: Request , res: Response , next: NextFunction) => {
    // console.log("files: " , req.files);
    // res.json({})

    // 'application/pdf'
    const {title , genre} = req.body;

    

    const files = req.files as {[fieldname: string]: Express.Multer.File[]};


    const coverImageMimeType = files.coverImage[0].mimetype.split('/').at(-1);
    const fileName = files.coverImage[0].filename;
    const filePath = path.resolve(__dirname , "../../public/data/uploads" , fileName);



    try {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: fileName,
            folder: "book-covers",
            format: coverImageMimeType,
        });

        const bookFileName = files.file[0].filename;
        const bookFilePath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            bookFileName
        );

        const bookFileUploadResult = await cloudinary.uploader.upload(
            bookFilePath,
            {
                resource_type: "raw",
                filename_override: bookFileName,
                folder: "book-pdfs",
                format: "pdf",
            }
        );

        //@ts-ignore
        console.log("userId: " , req.userId);
        
        const _req = req as AuthRequest;


        const newBook = await bookModel.create({
            title,
            genre,
            author: _req.userId,
            coverImage: uploadResult.secure_url,
            file: bookFileUploadResult.secure_url,
        });

        // Delete temp.files
        // todo: wrap in try catch...
        await fs.promises.unlink(filePath);
        await fs.promises.unlink(bookFilePath);

        res.status(201).json({ id: newBook._id });
        // res.status(201).json({message: "success"});

    } catch (err) {
        console.log(err);
        return next(createHttpError(500, "Error while uploading the files."));
    }

    
};

const updateBook = async (req: Request , res: Response , next: NextFunction) => {
    const {title , genre} = req.body;
    const bookId = req.params.bookId;
    const book = await bookModel.findOne({_id: bookId});

    if(!book){
        return next(createHttpError(404 , "Book not found"));
    }


    const _req = req as AuthRequest;
    if(book.author.toString() !== _req.userId){
        return next(createHttpError(403, " Unauthorized to update book "));
    }

    // check if image field exists
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let completeCoverImage = "";

    if(files.coverImage){
        const fileName = files.coverImage[0].filename;
        const converMimeType = files.coverImage[0].mimetype.split("/").at(-1);
        // send file to cloudinary
        const filePath = path.resolve(__dirname , "../../public/data/uploads" , fileName);
        completeCoverImage = fileName;

        const uploadResult = await cloudinary.uploader.upload(filePath , {
            filename_override: completeCoverImage,
            folder: "book-covers",
            format: converMimeType

        });

        completeCoverImage = uploadResult.secure_url;
        await fs.promises.unlink(filePath);
    };

    let completeFileName = "";
    if(files.file){
        const bookFileName = files.file[0].filename;
        const bookFilePath = path.resolve(__dirname , "../../public/data/uploads" , bookFileName);
        completeFileName = bookFileName;
        const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath , {
            resource_type : "raw",
            format: "pdf",
            folder: "book-pdfs",
            filename_override: bookFileName
        });
        completeFileName = uploadResultPdf.secure_url;
        await fs.promises.unlink(bookFilePath);


    };

    const updatedBook = await bookModel.findOneAndUpdate(
        {
            _id: bookId,
        },
        {
            title: title,
            genre: genre,
            coverImage: completeCoverImage
                ? completeCoverImage
                : book.coverImage,
            file: completeFileName ? completeFileName : book.file,
        },
        { new: true }
    );

    res.json(updatedBook);





};

const listBooks = async (req: Request , res: Response , next: NextFunction) => {
    try {

        // add pagination
        const book = await bookModel.find();
        res.json({book});
        
    } catch (error) {
        next(createHttpError(500 , "error while getting books"))
        
    }
}
const getSingleBook = async (req: Request , res: Response , next: NextFunction) => {
    
    // add pagination
    const bookId = req.params.bookId;
    try { 
        const book = await bookModel.findOne({_id: bookId});
        if(!book){
            return next(createHttpError(404,"Book not found"));
        }
        res.json(book);
        
    } catch (error) {
        next(createHttpError(500 , "error while getting books"))
        
    }
}

const deleteBook = async (req: Request , res: Response , next: NextFunction) => {
    
    // add pagination
    const bookId = req.params.bookId;
    try { 
        const book = await bookModel.findOne({_id: bookId});
        if(!book){
            return next(createHttpError(404,"Book not found"));
        }


        //check access
        const _req = req as AuthRequest;
        if(book.author.toString() !== _req.userId){
            return next(createHttpError(403 , "cant delete another's book "))
        }

        const coverImageSplits = book.coverImage.split("/");
        const coverImagePublicId = coverImageSplits.at(-2) +"/" + coverImageSplits.at(-1)?.split(".").at(-2);

        const coverFileSplits = book.file.split("/");
        const coverFilePublicId = coverFileSplits.at(-2) +"/" + coverFileSplits.at(-1);
        
        // console.log(coverFilePublicId , coverImagePublicId);
        
        try {
            await cloudinary.uploader.destroy(coverFilePublicId , {resource_type:"raw"});
            await cloudinary.uploader.destroy(coverImagePublicId);
        } catch (error) {
            next(createHttpError(500, "error while deleting from cloudinary"))
        }
       
        await bookModel.deleteOne({_id : bookId})

        res.status(204).json({_id : bookId});
        
    } catch (error) {
        next(createHttpError(500 , "error while getting books"))
        
    }
}



export {createBook , updateBook ,listBooks , getSingleBook , deleteBook };