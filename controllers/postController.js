const { createPostTable } = require("../models/postModels");
const uploadImage = require("../utils/firebase");
const db = require('../db/database')

createPostTable()
    .then(() => {
        console.log('Post Table creation completed');
    })
    .catch(error => {
        console.error('Error creating table:', error);
    });
const createPost = async(req,res) =>{
    try {
        const images = [];
        await Promise.all(
            req.files.images.map(async(item)=>{
                const url = await uploadImage(item);
                console.log(url,"Url")
                images.push(url);
            })
        )

        
        const query = 'INSERT INTO post (images, postedBy, likedBy,comments,commentUserIds) VALUES ($1, $2, $3,$4,$5) RETURNING *';
        const values = [images,req.userId,[],[],[]];
        console.log(values,"value")
        const result = await db.query(query, values);
        console.log(result.rows[0],"Post")
        res.status(201).json({error:false,data:result.rows[0]})

    } catch (error) {
        console.log(error)
        res.status(500).json({error:true,message:error})
    }
}
const likeUnlikePost = async(req,res) =>{
    try {
        const querry ='Select likedby from post where id = ($1)'
        const values=[req.body.post]
        let result = await db.query(querry,values)
        if(!result.rowCount) 
        {
            return res.status(403).json({error:true,message:'Post does not exist'})
        }

        const likedby = result.rows[0].likedby
        if(likedby.includes(req.userId))
        {
        
           const index=  likedby.indexOf(req.userId);
            likedby.splice(index,1)
        }
        else
        {
            likedby.push(req.userId)
        }
        const updateQuerry ='Update post set likedby = ($1) where id = ($2)'
        const updatValues =[likedby,req.body.post]
        await db.query(updateQuerry,updatValues)
        result =await db.query(querry,values)
        res.status(200).json({error:false,message:'Liked or Unliked Successfully',data:result.rows[0]})
    } catch (error) {
        console.log(error,"hererS")
        res.status(500).json({error:true,message:error})
    }
}
const createComment = async(req,res) =>{
    try {
        const querry = 'Select * from post where id = ($1)'
        const values =[req.body]
        const result = await db.query(querry,values);
        if(!result.rowCount) 
        {
            return res.status(402).json({error:true,message:'Post does not exist'})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({error:true,message:error})
    }
}

module.exports={
    createPost,
    likeUnlikePost
}