const { createUserTable } = require('../models/userModels');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
const db = require('../db/database')
const uploadImage = require('../utils/firebase')
dotenv.config();
createUserTable()
    .then(() => {
        console.log('User Table creation completed');
    })
    .catch(error => {
        console.error('Error creating table:', error);
    });

 const createUser =async (req,res) =>{
 try {
        let url=''
        if(req.file)
        {
            url =await uploadImage(req.file);

        }
        console.log(url);
        const hashedPassword =await bcrypt.hash(req.body.password, parseInt(process.env.SALT));
        console.log(hashedPassword,"Password")
        const query = 'INSERT INTO users (name, email, password,profile,followers_ids,following_ids) VALUES ($1, $2, $3,$4,$5,$6) RETURNING *';
        const values = [req.body.name,req.body.email,hashedPassword,url,[],[]];
        const result = await db.query(query, values);
        const token = jwt.sign({ email: req.body.email,id:result.rows[0].id }, process.env.JWTSECRET);
        res.setHeader('x-access-token', token)
        res.status(201).json({error:false,user:result.rows[0]})
   
 } catch (error) {
    console.log(error);
    res.status(500).json({error:true,message:"Error While Creating User" ,err:error})
 }
}
const login = async(req,res) =>{
    try {
        const querry = 'select * from users where email =$1'
        const values=[req.body.email]
        const result =await db.query(querry,values)
        if(!result.rowCount)
        {
            return res.status(402).json({error:true,message:'Email does not exist'})
        }
        const verify_password =await bcrypt.compare(req.body.password,result.rows[0].password)
        if(!verify_password)
        {
            return res.status(402).json({error:true,message:'Password does not match'})
        }
        const token =jwt.sign({ email: req.body.email,id:result.rows[0].id },process.env.JWTSECRET)
        res.setHeader('x-access-token', token)
        res.status(200).json({error:false,user:result.rows[0]})        
        
    } catch (error) {
        console.log(error)
        res.status(500).json({error:true,message:error})
    }
}
const followUnfollowPeople = async(req,res) =>{
    try {
        const querry ='select * from users where id = $1'
        const values = [req.body.id]
        const result =await db.query(querry,values);

        if (!result.rowCount) {
            return res.status(403).json({ error: true, message: 'Users does not exist' })
        }

        const followers_ids= result.rows[0].followers_ids;
        const followingValues=[req.userId]
        const followingResult=await db.query(querry,followingValues)
        const following_ids =followingResult.rows[0].following_ids
        if(followers_ids.includes(req.userId))
        {
            let index = followers_ids.indexOf(req.userId);
            followers_ids.splice(index, 1)  
            index= following_ids.indexOf(req.body.id);
            following_ids.splice(index,1)
        }
        else
        {
            followers_ids.push(req.userId)
            following_ids.push(req.body.id)
        }     
        
        const updateFollowerDataQuerry = 'Update users set followers_ids= $1 where id = $2'
        const valueFollowerData=[followers_ids,req.body.id]
        await db.query(updateFollowerDataQuerry,valueFollowerData)

        const updateFollowingDataQuerry = 'Update users set following_ids= $1 where id = $2'
        const valueFollowingData=[following_ids,req.userId]
        await db.query(updateFollowingDataQuerry,valueFollowingData)

        res.status(200).json({error:false,message:"Successfully updated followers"})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({error:true,message:error})
    }
}
const getPeopleNotFollowDetails = async(req,res) =>{
    try {
        const querry = 'SELECT id,name,email,profile,false as isfollowing FROM users WHERE NOT($1 = ANY( users.followers_ids))'
        const value = [req.userId]
        console.log(req.userId)
        const response = await db.query(querry,value)
        res.status(200).json({error:false,data:response.rows})
    } catch (error) {
        console.log(error)
       res.status(500).json({error:true,message:"Error while finding User Details"}) 
    }
}

const getFollowersDetails = async(req,res) =>{
    try {
        const querry = 'SELECT id,name,email,profile,followers_ids FROM users WHERE $1 = ANY( users.followers_ids)'
        const value = [req.query.id?req.query.id:req.userId]
        console.log(req.userId)
        const result = await db.query(querry,value)
        result.rows.map((item,index)=>{
            if(item.followers_ids.includes(req.userId))
            {
                result.rows[index].isFollowing= true
            }
            else
            {
                result.rows[index].isFollowing= false;
            }
        })
        res.status(200).json({error:false,data:result.rows})
    } catch (error) {
        console.log(error)
       res.status(500).json({error:true,message:"Error while finding User Details"}) 
    }
}
const getFollowingDetails = async(req,res) =>{
    try {
        const querry = 'SELECT id,name,email,profile,followers_ids FROM users WHERE $1 = ANY( users.following_ids)'
        const value = [req.query.id?req.query.id:req.userId]
        console.log(req.userId)
        const result = await db.query(querry,value)
        result.rows.map((item,index)=>{
            if(item.followers_ids.includes(req.userId))
            {
                result.rows[index].isFollowing= true
            }
            else
            {
                result.rows[index].isFollowing= false;
            }
        })
        res.status(200).json({error:false,data:result.rows})
    } catch (error) {
        console.log(error)
       res.status(500).json({error:true,message:"Error while finding User Details"}) 
    }
}




module.exports ={
    createUser,
    login,
    followUnfollowPeople,
    getPeopleNotFollowDetails,
    getFollowersDetails,
    getFollowingDetails
}