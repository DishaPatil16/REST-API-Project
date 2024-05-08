import {v2 as cloudinary} from 'cloudinary';
import { config } from './config';

cloudinary.config({ 
    cloud_name: config.cloundName, 
    api_key: config.cloudApiKey, 
    api_secret: config.cloudSecret
});

export default cloudinary;
