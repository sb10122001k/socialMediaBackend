const express = require('express')
const { createPost, likeUnlikePost } = require('../controllers/postController')
const multer = require('multer');
const authenticateUser = require('../utils/authenticate');
const router= express.Router()

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
});

router.post('/createPost',authenticateUser,upload.fields([{name:'images', maxCount: 5}]),createPost)
router.post('/likeUnlikePost',authenticateUser,likeUnlikePost)
module.exports = router