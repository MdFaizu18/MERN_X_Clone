import express from 'express';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import {v2 as cloudinary} from 'cloudinary'
dotenv.config();

const app = express();
// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


// importing routes from the routes folder 
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

app.use('/api/auth',authRoutes);
app.use('/api/user',userRoutes);

// connecting to the database
const port = 8080;
app.listen(port,async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log(`Server is running on port ${port}`);
    }catch(err){
        console.log(err);
        process.exit(1);
    }
});
