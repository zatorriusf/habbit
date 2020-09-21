//required packages
const router = require("express").Router();
const mongoose = require("mongoose");
//models
const User = require("../models/user");

router
  .route("/")
  //get all habits for a user
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
  //post new habit
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
  })
  //update existing habit
  .put(async (req,res)=>{
    const{habitId,title,frequency} = req.body;
    if(!habitId || !title ||['daily','weekly','bi-weekly','monthly'].indexOf(frequency) ===-1){
      res.status(400).send(`invalid request`);
      return;
    }
    if(!habitId || !title ||['daily','weekly','bi-weekly','monthly'].indexOf(frequency) ===-1){
      res.status(400).send(`invalid request`);
      return;
    }
    const user = await User.findOne({'habits._id' : habitId});
    const habitIndex = user.habits.findIndex(id => id=habitId);
    user.habits[habitIndex].title = title;
    user.habits[habitIndex].frequency = frequency;
    const savedUser  = await user.save();
    if(savedUser){
      res.status(200).json(savedUser.habits[habitIndex]);
      return;
    }
    res.status(400).send('failed request')
    
  })
  //delete habits
  .delete();
router.route("/track")
      //tracking ha
      .put()
  module.exports = router;
