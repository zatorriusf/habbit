//required packages
const router = require('express').Router();
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcrypt');
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
        await user.save()
        res.status(200).json({
            email : user.email,
            lastLogin : user.lastLogin.toDateString()
        })
      } else {
        res.status(400).send(`invalid username or password`);
      }
    } else {
      res.status(400).send(`invalid username or password`);
    }
})


module.exports = router;