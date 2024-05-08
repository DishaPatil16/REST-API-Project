import mongoose from "mongoose"
import { config } from "./config"


const connectDB = async () => {
    try {
        mongoose.connection.on('connected' , ()=>{ // mongoose.connection is the event we get after connecting
            console.log("connected to db success ");
            
        })
        mongoose.connection.on('error' , (err)=>{
            console.log("failed to connect db  " , err);
            
        })
        await mongoose.connect(config.databaseUrl as string)  // listeners pehle
        
       

        
    } catch (error) {
        console.error("connection failed" , error)
        process.exit(1);
    }
} ;
export default connectDB;