const express = require('express')
const { createUser, followUnfollowPeople, login, getPeopleNotFollowDetails, getFollowersDetails, getFollowingDetails } = require('../controllers/userController')
const multer = require('multer');
const authenticateUser = require('../utils/authenticate');
const router= express.Router()

const storage = multer.memoryStorage();
const upload = multer({storage})


router.post('/createUsers',upload.single('image'),createUser)
router.post('/login',login)
router.post('/followUnfollow',authenticateUser,followUnfollowPeople)

router.get('/getPeopleNotFollowDetails',authenticateUser,getPeopleNotFollowDetails)
router.get('/getFollowersDetails',authenticateUser,getFollowersDetails)
router.get('/getFollowingDetails',authenticateUser,getFollowingDetails)
module.exports = router