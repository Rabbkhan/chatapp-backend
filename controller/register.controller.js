const UserModel = require("../model/user.model")
const bcryptjs = require('bcryptjs')
const registeruser =async (req,res)=>{
    try {
        const{name, email, password, profile_pic} = req.body
//checking email already exists or not
const checkEmail = await UserModel.findOne({email}) 
if(checkEmail){
    return res.status(400).json({
        message:"Already user exists",
        error:true
    })
}


//password into hashpassword

const salt = await bcryptjs.genSalt(10);
const hashpassword = await bcryptjs.hash(password,salt)

const payload ={
    name,
    email,
    profile_pic,
    password:hashpassword
}

const user = new UserModel(payload)
const userSave = await user.save()
return res.status(201).json({
    message:"User created successfully",
    data:userSave,
    sucess:true
})
    } catch (error) {
        return res.status(500).json({
            message: error.message ||error,
            error:true
        })
    }
}


module.exports = registeruser;