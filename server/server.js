import express from 'express';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();

const app = express();
// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


// importing routes from the routes folder 
import authRoutes from './routes/authRoutes.js';

app.use('/api/auth',authRoutes);

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
