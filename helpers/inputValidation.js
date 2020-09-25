const joi = require('joi');

const validateRegistrationData = (req,res,next) =>{
    const registraionRules = joi.object({
        email : joi.string().min(6).required().email(),
        password : joi.string().min(8).required()
    });
    const hasErrors = registraionRules.validate(req.body).error ? true : false;
    if(hasErrors){
        return res.status(400).send('cannot create account with given information');
    }
    next();
}
const loginValidation = (req,res,next) =>{
    
    const registraionRules = joi.object({
        email : joi.string().min(6).required().email(),
        password : joi.string().min(8).required()
    });
    const hasErrors = registraionRules.validate(req.body).error ? true : false;
    if (hasErrors){
        return res.status(400).send('invalid login information');
    }
    next();
}

module.exports.validateRegistrationData = validateRegistrationData;
module.exports.loginValidation = loginValidation;