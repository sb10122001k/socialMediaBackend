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
        const query = 'INSERT INTO users (name, email, password,profile,friend_ids) VALUES ($1, $2, $3,$4,$5) RETURNING *';
        const values = [req.body.name,req.body.email,hashedPassword,url,[]];
        const result = await db.query(query, values);
        const token = jwt.sign({ email: req.body.email,id:result.rows[0].id }, process.env.JWTSECRET);
        res.setHeader('x-access-token', token)
        console.log(token)
        res.status(201).json({error:false,user:result.rows[0]})
   
 } catch (error) {
    console.log(error);
    res.status(500).json({error:true,message:"Error While Creating User" ,err:error})
 }
}


module.exports ={
    createUser
}