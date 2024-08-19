import userModel from "../models/userModel.js";
import {v2 as cloudinary} from 'cloudinary';
import { comparePassword, hashPassword } from "../utils/PasswordUtils.js";

// to get the user profile details
export const getUserProfile = async(req,res)=>{
    const {username} = req.params;
    try{
    // getting the user with the username from the database 
      const user = await userModel.findOne({userName:username}).select("-password");
      if(!user){
        return res.status(404).json({msg: "User not found"});
      }
      res.status(200).json({user})
    }catch(error){
        return res.status(500).json({msg: error.message});
    }
}

// to make the user follow or unfollow another user 
export const followUnfollowUser = async(req,res)=>{
    const {id} = req.params; // getting the id which have to follow
    try {
    // getting the user id from the params and the current user id from the request
    const userToModify = await userModel.findById(id); // their details
    const currentUser = await userModel.findById(req.user); // our details
    if (id === req.user.toString()){
        return res.status(400).json({msg:"You can't follow yourself"});
    }
    if(!userToModify || !currentUser){
        return res.status(404).json({msg:"User not found"});
    }
    const isFollowing = userToModify.followers.includes(id);
    if(isFollowing){
        // to unfollow the user
        await userModel.findByIdAndUpdate(id,{$pull:{followers:req.user}});
        await userModel.findByIdAndUpdate(req.user,{$pull:{following:id}});
        //TODO: Add a notification for unfollowing the user
        const newNotification = new Notification({
            type:"unfollow",
            from:req.user,
            to:id
        });
        await newNotification.save(); 
        res.status(200).json({msg:"User unfollowed successfully"});
    }else{
        // to follow the user
        await userModel.findByIdAndUpdate(id,{$push:{followers:req.user}});
        await userModel.findByIdAndUpdate(req.user,{$push:{following:id}});
        //TODO: Add a notification for unfollowing the user
        res.status(200).json({msg:"User followed successfully"});
    }
    } catch (error) {
        return res.status(500).json({msg:error.message})
    }
}

// to get the suggested users for the current user 
export const getSuggestedUsers = async (req,res)=>{
    try{
     const userId = req.user;
     const userFollowedByMe = await userModel.findById(userId).select("following");
     console.log(userFollowedByMe);
     const users = await userModel.aggregate([
        {
            $match:{
                _id:{$ne:userId}
            }
        },
        {$sample:{size:10}}
     ]);
     const filteredUsers = users.filter((user)=>!userFollowedByMe.following.includes(user._id));
     const suggestedUsers = filteredUsers.slice(0,4);
     suggestedUsers.forEach(user=>user.password=null)
     res.status(200).json({suggestedUsers});
    }catch(err){
        return res.status(500).json({msg:err.message});
    }
}

// to update the user profile details 
export const updateUserProfile = async (req, res) => {
    const { userName, fullName, email, currentPassword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body; // Let the variables be mutable

    const userId = req.user;

    try {
        // Fetch the user by their ID
        let user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        // If the user provides only one of the passwords, return an error
        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ msg: "Please provide both current and new password" });
        }

        // If both passwords are provided, verify the current password and update it
        if (currentPassword && newPassword) {
            const isMatch = await comparePassword(currentPassword, user.password); // Await needed for async
            if (!isMatch) return res.status(400).json({ msg: "Invalid current password" });

            if (newPassword.length < 6) {
                return res.status(400).json({ msg: "Password must be at least 6 characters long" });
            }

            const hashedPassword = await hashPassword(newPassword); // Await needed for async
            user.password = hashedPassword;
        }

        // If a new profile image is provided, update it on Cloudinary
        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadResponse.secure_url;
        }

        // If a new cover image is provided, update it on Cloudinary
        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadResponse.secure_url;
        }

        // Update the user's fields with the new data, or keep existing data if no new data is provided
        user.fullName = fullName || user.fullName;
        user.userName = userName || user.userName;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        // Save the updated user data to the database
        user = await user.save();

        // Set the password to null before sending the response to avoid leaking sensitive data
        user.password = null;
        res.status(200).json({ user });

    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
};
