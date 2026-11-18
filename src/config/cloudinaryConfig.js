import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const requiredSettings = ['CLOUDINARY_NAME', 'API_KEY', 'API_SECRET'];
const missingSettings = requiredSettings.filter((setting) => !process.env[setting]?.trim());

if (missingSettings.length > 0) {
    throw new Error(`Missing Cloudinary environment variable(s): ${missingSettings.join(', ')}`);
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME.trim(),
    api_key: process.env.API_KEY.trim(),
    api_secret: process.env.API_SECRET.trim()
});

export default cloudinary;