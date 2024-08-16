import { verifyToken } from "../utils/TokenUtils.js";

export const authenticateUser =  (req,res,next)=>{
    const {token} = req.cookies;
    if(!token){
        console.log("No token found");
        return res.status(400).json({message:"No token found"});
    }
    try{
        const {userId} = verifyToken(token);
        req.user = userId;
        console.log("from authUser",req.user);
        next();
    }catch(err){
        console.log(err,"getting in the authUser catch block");
        return res.status(401).json({message:"Invalid token"})
    }
}
