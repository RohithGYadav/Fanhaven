// /lib/multerConfig.js

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: 'your_cloud_name',
  api_key: 'your_api_key',
  api_secret: 'your_api_secret',
});

// Create a Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Specify the folder in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed file formats
  },
});

// Set up multer with the Cloudinary storage
const upload = multer({ storage: storage });

export default upload;
