const express = require('express');
const registeruser = require('../controller/register.controller');
const checkEmail = require('../controller/checkEmail.controller');
const checkPassword = require('../controller/password.controller');
const userDetails = require('../controller/userDetails');
const logout = require('../controller/logout.controller');
const updateUserDetails = require('../controller/updateUserDetails.controller');
const searchUser = require('../controller/searchUser.controller');
const router = express.Router();

//create user api
router.post('/register', registeruser)
//check email 
router.post('/email', checkEmail)
// check password  
router.post('/password',checkPassword)
//login user details 
router.get('/user-details', userDetails)
//logout user 
router.get('/logout', logout)
//update user details
router.put('/update-user', updateUserDetails)
//search user
router.post('/search-user', searchUser)


module.exports = router
