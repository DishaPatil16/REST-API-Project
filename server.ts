import app from "./src/app";
import { config } from "./src/config/config";
import connectDB from "./src/config/db";

const startServer = async() => {
    //connect database  
    await connectDB();

    // const port = process.env.PORT || 3000; // get from node's process
    // const port = config.port || 3000;
    const port = config.port || 3000;

    app.listen(port, () => {
        console.log(`Listening on port: ${port}`);
      });
    };



startServer();