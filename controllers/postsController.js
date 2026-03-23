const Post = require("../models/postsModel");


exports.getPosts = async (req, res) => {
    const {page} = req.query;
    const postsPerPage = 10;

    try{
        let pageNum = 0;
        if(page <= 1){
            pageNum = 0;
        } else {
            pageNum = page - 1
        }

        const result = await Post.find().sort({createdAt: -1}).skip(pageNum * postsPerPage).limit(postsPerPage).populate({
            path: "userId",
            select: "email",
        });
        res.status(200).json({message: "Posts fetched successfully!", data: result});

    } catch(err){
        res.status(500).json({message: "Error fetching posts", error: err.message});
    }
};


exports.singlePost = async (req, res) => {
    const {_id} = req.query;

    try{
       

        const result = await Post.findOne({_id}).populate({
            path: "userId",
            select: "email",
        });
        if(!existingPost){
            return res.status(404).json({message: "Post not found"});
        }
        res.status(200).json({message: "single post fetched successfully!", data: result});

    } catch(err){
        res.status(500).json({message: "Error fetching posts", error: err.message});
    }
};


exports.createPost = async (req, res) => {
    const {title, description} = req.body;
    const {userId} = req.user;

    try{
        const {error, value} = createPostSchema.validate({title, description, userId});
        if(error){
            return res.status(400).json({message: "Validation error", error: error.details[0].message});
        }
        const result = await Post.create({title, description, userId}); 
        res.status(201).json({message: "created!", data: result});
    } catch(err){
        res.status(500).json({message: "Error creating post", error: err.message});
    }
};


exports.updatePost = async (req, res) => {
    const {_id} = req.query;
    const {title, description} = req.body;
    const {userId} = req.user;

    try{
        const {error, value} = createPostSchema.validate({title, description, userId});
        if(error){
            return res.status(400).json({message: "Validation error", error: error.details[0].message});
        }
        const existingPost = await Post.findOne({_id});
        if(!existingPost){
            return res.status(404).json({message: "Post not found"});
        }
        if(existingPost.userId.toString() !== userId){
            return res.status(403).json({message: "You are not authorized to update this post"});
        }
        existingPost.title = title;
        existingPost.description = description;

        const result = await existingPost.save();
        res.status(200).json({message: "Post updated successfully!", data: result});
    } catch(err){
        res.status(500).json({message: "Error updating post", error: err.message});
    }
};


exports.deletePost = async (req, res) => {
    const {_id} = req.query;
    const {userId} = req.user;

    try{
        
        const existingPost = await Post.findOne({_id});
        if(!existingPost){
            return res.status(404).json({message: "Post not found"});
        }
        if(existingPost.userId.toString() !== userId){
            return res.status(403).json({message: "You are not authorized to update this post"});
        }

        await Post.deleteOne({_id});
        res.status(200).json({message: "Post deleted successfully!"});
    } catch(err){
        res.status(500).json({message: "Error deleting post", error: err.message});
    }
};
