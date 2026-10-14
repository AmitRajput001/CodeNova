const jwt = require('jsonwebtoken');
const User = require('../Models/user');
const redisClient = require('../config/redis');

const userMiddleware = async(req,res,next)=>{
    try{
        console.log("Cookies:", req.cookies);
        const {token} = req.cookies;
        if(!token)
            throw new Error('Invalid Token');
        const payload = jwt.verify(token,process.env.JWT_KEY);

        const {_id} = payload;
        
        if(!_id)
            throw new Error("Id is Missing");

        const result = await User.findById(_id);

        if(!result)
            throw new Error("User doesn't exist");

        // check if it is in redis blockList

        const isBlocked = await redisClient.exists(`token:${token}`);
        if(isBlocked)
            throw new Error("Invalid Token");

        req.result = result;
        next();

    }catch(err){
        res.status(401).send("Error "+err.message);
    }
}

module.exports = userMiddleware;