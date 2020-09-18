//required packages
const router = require("express").Router();
const mongoose = require("mongoose");
//models
const User = require("../models/user");

router
  .route("/")
  .get((req, res) => {
    res.status(200).send(`habit get route`);
  })
  .post(async (req, res) => {
    
    const {userId,title,frequency} = req.body;
    if(!userId || !title ||['daily','weekly','bi-weekly','monthly'].indexOf(frequency) ===-1){
      res.status(400).send(`invalid request`);
      return;
    }
    const user = await User.findById(userId);
    if(user){
        user.habits.push({title: title, frequency : frequency});
        user.save((err,user) =>{
            if(err){
                console.error(err);
                res.status(400).send(err);
            } else {
                res.status(200).send(user.habits[user.habits.length-1]);
            }
        }); 
    } else {
        
        res.status(400).send('failed');

    }
    
    
  });

module.exports = router;
