import { config as conf } from 'dotenv'; // to get variables from .env file
conf();

const _config = { //convention
    port: process.env.PORT,
    env: process.env.NODE_ENV,
    databaseUrl: process.env.MONGO_CONNECTION_STRING,
    jwtSecret: process.env.JWT_SECRET,
    cloundName: process.env.CLOUDINARY_CLOUD,
    cloudApiKey: process.env.CLOUDINARY_API_KEY,
    cloudSecret: process.env.CLOUDINARY_API_SECRET,
    frontendDomain: process.env.FRONTEND_DOMAIN


};

export const config = Object.freeze(_config); // to make config read only // cant be overidden
