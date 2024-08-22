import postModel from "../models/postModel.js";
import notificationModel from "../models/notificationModel.js";
import { v2 as cloudinary } from 'cloudinary';
import userModel from "../models/userModel.js";

// to create a new posts 
export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user.toString();

        console.log(userId);

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        if (!text && !img) return res.status(400).json({ error: "Post must have text or image" });

        if (img) {
            const uploadImage = await cloudinary.uploader.upload(img);
            img = uploadImage.secure_url;
        }

        // Ensure you're using the correct field name expected by your schema
        const newPost = await postModel.create({ user: userId, text, img });

        res.status(201).json(newPost);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// to delete the existing post 
export const deletePost = async (req,res)=>{
    try {
     const post = await postModel.findById(req.params.id);
     if(!post) return res.status(404).json({msg:"Post not found"});
     if(post.user.toString()!==req.user) return res.status(403).json({msg:"You are not authorized to delete this post"});
     if(post.img){
         await cloudinary.uploader.destroy(post.img.split("/").pop().split(".")[0]);
     }
     await postModel.findByIdAndDelete(req.params.id);
     res.json({msg:"Post deleted successfully"});
    } catch (error) {
        return res.status(500).json({msg:error.message});
    }
}

// to comment on the posts 
export const commentOnPost = async (req,res)=>{ 
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user.toString();

        if(!text) return res.status(400).json({msg:"Comment can't be empty"});

        const post = await postModel.findById(postId);
        if(!post) return res.status(404).json({msg:"Post not found"});

        const comment = {user:userId,text};
        post.comments.push(comment);
        await post.save();
        res.json({msg:"Comment added successfully",posts:post});
    } catch (error) {
        return res.status(500).json({msg:error.message});
    }
}

// to like and unlike the comments 
export const likePost = async(req,res)=>{
    try {
        const userId = req.user;
        const postId = req.params.id;
        const post = await postModel.findById(postId);
        if(!post) return res.status(404).json({msg:"Post not found"});

        const userLikedPost = post.likes.includes(userId);
        if(userLikedPost){
            // unlike the post 
            await postModel.updateOne({_id:postId},{$pull:{likes:userId}});
            await userModel.updateOne({_id:userId},{$pull:{likedPosts:postId}});
            res.json({msg:"Post unliked successfully"});
        }else{
            // like the post 
            post.likes.push(userId);
            await userModel.updateOne({_id:userId},{$push:{likedPosts:postId}});
            await post.save();

           const notification = await notificationModel.create({
               from:userId,
               to:post.user,
               type:"like"
              });
            res.status(200).json({msg:"Post liked successfully"});
        }
    } catch (error) {
        console.log("error in likepost controller",error)
        return res.status(500).json({msg:error.message});
    }
}

// to get all posts for development purpose alone
export const getAllPosts = async (req,res)=>{
    try {
        const posts = await postModel.find().
        sort({createdAt:-1}).
        populate({
            path:"user",
            select:"-password"
        })
        .populate({
            path:"comments.user",
            select:"-password"
        })
        res.json(posts);
    } catch (error) {
        return res.status(500).json({msg:error.message});
    }
}

// to get the post which is liked by own 
export const getLikedPosts = async (req,res)=>{
    const userId = req.params.id;
    try{
      const user = await userModel.findById(userId);
      if(!user) return res.status(404).json({msg:"User not found"});

      const likedPosts = await postModel.find({_id:{$in:user.likedPosts}})
      .populate({
        path:"user",
        select:"-password"
      })
        .populate({
            path:"comments.user",
            select:"-password"
        })
        res.status(200).json(likedPosts);  
    }catch(error){
        return res.status(500).json({msg:error.message});
    }
}

// to get the posts which was posted by the following user 
export const getFollowingPosts = async (req,res) => {
    try {
        const userId = req.user;
        const user = await userModel.findById(userId);
        if(!user) return res.status(404).json({msg:"User not found"});

        const following = user.following;
        const feedPosts = await postModel.find({user:{$in:following}})
        .sort({createdAt:-1})
        .populate({
             path:'user',
             select:"-password"
        })
        .populate({
            path:'comments.user',
            select:"-password"
        })
        res.status(200).json(feedPosts);
    } catch (error) {
        return res.status(500).json({msg:error.message});
    }
};

// to get the user posts which was created by his own 
export const getUserPosts = async (req,res)=>{
    try {
        const userName = req.params.username;
        const user = await userModel.findOne({userName:userName});
        if(!user) return res.status(404).json({msg:"User not found"});
        const userId = user._id;
        const posts = await postModel.find({user:userId})
        .sort({createdAt:-1})
        .populate({
            path:'user',
            select:"-password"
        })
        .populate({
            path:'comments.user',
            select:"-password"
        });
        res.status(200).json(posts);    
    } catch (error) {
        return res.status(500).json({msg:error.message});
    }
}

