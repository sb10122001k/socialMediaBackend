const express = require('express')
const { createUser } = require('../controllers/userController')
const multer = require('multer')
const router= express.Router()

const storage = multer.memoryStorage();
const upload = multer({storage})


router.post('/createUsers',upload.single('image'),createUser)
module.exports = router