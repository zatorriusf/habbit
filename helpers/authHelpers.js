const jwt = require("jsonwebtoken");

const isAuth = (req,res,next) =>{
    try{
        const token = req.header("token");
        const verifiedToken = jwt.verify(token,process.env.JWT_TOKEN_SECRET);
        if(verifiedToken){
          req.userId = verifiedToken.userId;
          next();  
        }
    } catch (err){
        res.status(400).send('Unable to Authenticate user')
    }
}

module.exports.isAuth = isAuth;