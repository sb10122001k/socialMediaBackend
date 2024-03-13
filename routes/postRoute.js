const express = require('express')
const { createPost, likeUnlikePost, createComment, getFeed, getUserProfile } = require('../controllers/postController')
const multer = require('multer');
const authenticateUser = require('../utils/authenticate');
const router= express.Router()

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
});

router.post('/createPost',authenticateUser,upload.single('images'),createPost)
router.post('/likeUnlikePost',authenticateUser,likeUnlikePost)
router.post('/addComment',authenticateUser,createComment)


router.get('/getFeed',authenticateUser,getFeed)
router.get('/getProfile',authenticateUser,getUserProfile)
module.exports = router