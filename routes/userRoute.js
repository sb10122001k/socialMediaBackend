const express = require('express')
const { createUser, followUnfollowPeople, login } = require('../controllers/userController')
const multer = require('multer');
const authenticateUser = require('../utils/authenticate');
const router= express.Router()

const storage = multer.memoryStorage();
const upload = multer({storage})


router.post('/createUsers',upload.single('image'),createUser)
router.post('/login',login)
router.post('/followUnfollow',authenticateUser,followUnfollowPeople)
module.exports = router