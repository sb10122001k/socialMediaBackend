const express= require('express');
const cors = require('cors')
const dotenv = require('dotenv')
const userRoutes = require('./routes/userRoute')
const postRoutes = require('./routes/postRoute')
dotenv.config()

const app = express();
app.use(cors())
app.use(express.json())

const port = process.env.PORT || 9999;


app.use('/',(req,res,next)=>{
    try {
        console.log(req.method, req.url);
        next();
    } catch (error) {
        console.log("Error",error);
        res.status(500).json({error:true,messge:error})
    }
})

app.use('/users',userRoutes)
app.use('/posts',postRoutes)

app.listen(port,()=>{
    console.log("Server Started at port :" ,port)
})



