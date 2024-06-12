const jwt = require('jsonwebtoken');
const UserModel = require('../model/user.model');

const getUserDetailsFromToken = async(token) =>{
    if(!token){
        return{
            message:"session out",
            logout:true
        }
    }

    const decode = await jwt.verify(token,process.env.JWT_SECRET_KEY);
    const user = await UserModel.findById(decode.id).select('-password')
    return user
}

module.exports=getUserDetailsFromToken