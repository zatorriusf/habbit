//required packages
const router = require("express").Router();
const mongoose = require("mongoose");
//models
const User = require("../models/user");

router
  .route("/")
  .get(async (req, res) => {
    const {userId} = req.body;
    if(!userId){
      res.status(400).send('invalid user');
      return;
    }
    const user = await User.findById(userId);
    if(user.habits === 0){
      res.status(200).send('no habits yet. How about we create one')
      return
    }

    res.status(200).send(user.habits);
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
