import userModel from "../models/userModel.js";
import { comparePassword, hashPassword } from "../utils/PasswordUtils.js";
import { createToken } from "../utils/TokenUtils.js";

// to create a register route functionality
export const register = async(req,res)=>{
  try{
    // destructing the request body to get the required fields
    const {userName,email,password} = req.body;
    // checking email should be in the proper format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        return res.status(400).json({message:"Invalid email format"});
    }
    // checking password should be atleast 6 characters long
    if(password.length < 6){
        return res.status(400).json({message:"Password must be atleast 6 characters long"});
    }
    // checking if the user with the same username already exists
    const existingUser = await userModel.findOne({userName:userName});
    if(existingUser){
        return res.status(400).json({message:"User with this username already exists"});
    }
    // checking if the user with the same email already exists
    const existingEmail = await userModel.findOne({email:email});
      if (existingEmail){
        return res.status(400).json({message:"User with this email already exists"});
    }
    const encryptPassword = await hashPassword(password);
    req.body.password = encryptPassword;
    // creating a new user
    console.log(res.body);
    const newUser = await userModel.create(req.body);
    const token = createToken({userId:newUser._id});
    console.log(token);
    const oneDay = 1000 * 60 * 60 * 24;
    res.cookie("token",token,{
        httpOnly:true, // for prevent corss site scrpting attacks
        sameSite:true, // for preventing csrf attacks
        expires:new Date(Date.now() + oneDay)
    });
    res.status(201).json({newUser});
  }catch(err){
    res.status(500).json({message:err.message,msg:"internal server error"});
  }
};

// to create a login route functionality 
export const login = async(req,res)=>{
    try {
        const {userName,password, email} = req.body;
        // checking if the user with the same username already exists
        const existingUser = await userModel.findOne({email});
        // checking if the password is correct
        const isMatch = await comparePassword(password,existingUser.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid credentials"});
        }
        const token = createToken({userId:existingUser._id});
        console.log("token from login: ",token)
        const oneDay = 1000 * 60 * 60 * 24;
        res.cookie("token",token,{
            httpOnly:true, // for prevent corss site scrpting attacks
            sameSite:true, // for preventing csrf attacks
            expires:new Date(Date.now() + oneDay)
        });
        res.json({message:"User logged in successfully",user:existingUser});

    } catch (error) {
        res.status(500).json({message:error.message,msg:"internal server error"});
    }
};

// to create a logout route functionality
export const logout = (req,res)=>{
    res.cookie("token","logout",{
        httpOnly:true,
        expires:new Date(Date.now())
    })
    console.log("User logged out successfully");
    res.json({message:"User logged out successfully"});
};

// to get the current user 
export const currentUser = async (req, res) => {
    try {
        console.log("from currentUser",req.user);
        const user = await userModel.findById(req.user);
        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message, msg: "internal server error" });
    }
}

// to get all users details 
export const getAllUsers = async (req,res)=>{
    try{
        const users = await userModel.find().select("-password");
        res.status(200).json(users);
    }
    catch(err){
        res.status(500).json({message:err.message,msg:"internal server error"});
    }
}

// to get the user details by id 
export const getUserById = async (req,res)=>{
    try {
        const userToGet = req.params.id;
        const user = await userModel.findById(userToGet).select("-password");
        if(!user) return res.status(404).json({msg:"User not found"});
        res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({msg:error.message})
    }
}