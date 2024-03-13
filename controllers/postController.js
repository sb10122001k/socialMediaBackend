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

const getCommentsandLikeDetail = async(result,userId) =>{
    await Promise.all(
        result.rows.map(async (post,i)=>{
            if(post.likedby.includes( userId) )
            {
                result.rows[i].liked=true
            }
            else 
            {
                result.rows[i].liked=false
            }
            const comments=[];
            await Promise.all(
                post.commentuserids.map(async(item,index)=>{
                    const selectUserQuerry = 'select * from users where id = $1'
                    const selectUserQuerryValue=[item]
                    const userDetails = await db.query(selectUserQuerry,selectUserQuerryValue)
                    console.log(userDetails.rows[0],"data")
                    const comment={
                        id:item,
                        comment:result.rows[i].comments[index],
                        profilePic:userDetails.rows[0].profile,
                        name:userDetails.rows[0].name
                    }
                    comments.push(comment)
                })
            )
                           
            result.rows[i].comments=comments

        })
    )
    return result;
}
const createPost = async (req, res) => {
    try {
        const images = [];
        let url=''
        if(req.file)
        {
            url =await uploadImage(req.file);

        }
        images.push(url)


        const query = 'INSERT INTO post (images, postedBy, likedBy,comments,commentUserIds) VALUES ($1, $2, $3,$4,$5) RETURNING *';
        const values = [images, req.userId, [], [], []];
        console.log(values, "value")
        const result = await db.query(query, values);
        console.log(result.rows[0], "Post")
        res.status(201).json({ error: false, data: result.rows[0] })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: true, message: error })
    }
}
const likeUnlikePost = async (req, res) => {
    try {
        const querry = 'Select likedby from post where id = ($1)'
        const values = [req.body.post]
        let result = await db.query(querry, values)
        if (!result.rowCount) {
            return res.status(403).json({ error: true, message: 'Post does not exist' })
        }

        const likedby = result.rows[0].likedby
        if (likedby.includes(req.userId)) {

            const index = likedby.indexOf(req.userId);
            likedby.splice(index, 1)
        }
        else {
            likedby.push(req.userId)
        }
        const updateQuerry = 'Update post set likedby = ($1) where id = ($2)'
        const updatValues = [likedby, req.body.post]
        await db.query(updateQuerry, updatValues)
        result = await db.query(querry, values)
        res.status(200).json({ error: false, message: 'Liked or Unliked Successfully', data: result.rows[0] })
    } catch (error) {
        console.log(error, "hererS")
        res.status(500).json({ error: true, message: error })
    }
}
const createComment = async (req, res) => {
    try {
        const querry = 'Select * from post where id = ($1)'
        const values = [req.body.post]
        let result = await db.query(querry, values);
        if (!result.rowCount) {
            return res.status(402).json({ error: true, message: 'Post does not exist' })
        }
        const comment = result.rows[0].comments;
        comment.push(req.body.comment)
        const commentuserids = result.rows[0].commentuserids;
        commentuserids.push(req.userId)
        const updateQuerry = 'UPDATE post SET comments = $1, commentuserids = $2 WHERE id = $3';
        const updateValues = [comment, commentuserids, req.body.post];

        await db.query(updateQuerry, updateValues);
        result = await db.query(querry, values);

        res.status(200).json({ error: false, data: result.rows[0] })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: true, message: error })
    }
}

const getFeed = async(req,res)=>{
    try {
        const querry = 'select post.id,images,likedBy,comments,commentUserIds,name,postedBy,profile from post join users on users.id = post.postedBy  where postedBy  in (select unnest(following_ids) from users where id = $1 ) order by id desc'
        const value =[req.userId]
        let result = await db.query(querry,value);
        result = await getCommentsandLikeDetail(result,req.userId)
        res.status(200).json({error:false,data:result.rows})
    } catch (error) {
        console.log(error)
      res.status(500).json({error:true,message:error})
    }
}

const getUserProfile =async(req,res) =>{
    try {
        const querry = 'select * from post where postedBy  = $1 order by id desc'
        const value =[req.query.id?req.query.id:req.userId]
        let result = await db.query(querry,value);
        result = await getCommentsandLikeDetail(result,req.userId)
        console.log(result.rows,"Data")
        const userQuerry = 'select id,name,email,profile,followers_ids,following_ids from users where id= $1';
        const userDetails=await db.query(userQuerry,value);

        res.status(200).json({error:false,postDetails:result.rows,userDetails:userDetails.rows[0]})
    } catch (error) {
        res.status(500).json({error:true,message:'Error While Fetching User Post'})
    }
}

module.exports = {
    createPost,
    likeUnlikePost,
    createComment,getFeed,
    getUserProfile
}