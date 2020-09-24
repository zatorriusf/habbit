//required packages
const router = require('express').Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//models
const User = require('../models/user');

router.post('/register',async (req,res)=>{
    const{email,password} = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = await new User({
        email : email,
        password : hashedPassword
    }).save((err, user) =>{
        if(err){
            console.error(err);
            res.status(400).send(err)
        } else {
            res.json({
                email : user.email,
                message : `${user.email} succesfully created!`
            })
        }
    })
})

router.post('/login', async (req,res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });
    if (user) {
      const matchedPass = await bcrypt.compare(password, user.password);
      if (matchedPass) {
        //creating and send JSONToken
        user.lastLogin = new Date();
        await user.save();
        const token = jwt.sign({userId : user._id},process.env.JWT_TOKEN_SECRET);
        res.status(200).json({
            email : user.email,
            token : token
        })
      } else {
        res.status(400).send(`invalid username or password`);
      }
    } else {
      res.status(400).send(`invalid username or password`);
    }
})


module.exports = router;