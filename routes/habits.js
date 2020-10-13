//required packages
const router = require("express").Router();
const mongoose = require("mongoose");
//models
const User = require("../models/user");

router
  .route("/")
  //get all habits for a user
  .get(async (req, res) => {
    const userId = req.userId;
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
    
    const {title,frequency,desc} = req.body;
    const userId = req.userId;
    if(!userId ||!desc|| !title ||['daily','weekly','bi-weekly','monthly'].indexOf(frequency) ===-1){
      res.status(400).send(`invalid request`);
      return;
    }
    const user = await User.findById(userId);
    if(user){
        user.habits.push(req.body);
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
  .patch(async (req,res)=>{
    const{habitId,title,frequency,desc} = req.body;
    if(!habitId || !desc || !title ||['daily','weekly','bi-weekly','monthly'].indexOf(frequency) ===-1){
      res.status(400).send(`invalid request`);
      return;
    }
    const user = await User.findOne({'habits._id' : habitId});
    const habitIndex = user.habits.findIndex(id => id=habitId);
    user.habits[habitIndex].title = title;
    user.habits[habitIndex].frequency = frequency;
    user.habits[habitIndex].desc = desc;
    const savedUser  = await user.save();
    if(savedUser){
      res.status(200).json(savedUser.habits[habitIndex]);
      return;
    }
    res.status(400).send('failed request')
    
  })
  //delete habits
  .delete(async (req,res)=>{
    const {habitIds} = req.body;
    const userId = req.userId
    if(!userId || habitIds.length === 0){
      res.status(400).send('invalid request');
      return;
    }
    const user = await User.findById(userId)
                                .catch(err=>{
                                  res.status(400).send(err)
                                });
    const originalLenght = user.habits.length;
    user.habits = user.habits.filter(habit => !habitIds.includes(habit._id.toString()));
    await user.save().catch(err => res.send(err));
    res.status(200).send(`${originalLenght - user.habits.length} habit(s) removed`);
  });
router.route("/track")
  //tracking habits
  .patch(async (req,res)=>{
    
    const {habitId} = req.body
    if(!habitId){
      res.status(400).send('invalid request');
      return;
    }
    
    const user = await User.findOne({'habits._id' : habitId});
    const habitIndex = user.habits.findIndex(habit => habit._id.toString()===habitId);
    if(habitIndex === -1){
      res.status(400).send('habit not found');
    }
    let habit = user.habits[habitIndex];

    if(habit.lastActivity){
      let nextAvialableUpdate = new Date(habit.lastActivity);
    switch(habit.frequency){
      case 'daily':
          nextAvialableUpdate.setDate(nextAvialableUpdate.getDate() + 1);
          break;
      case 'weekly':
        nextAvialableUpdate.setDate(nextAvialableUpdate.getDate() + 7);
        break;
      case 'bi-weekly':
        nextAvialableUpdate.setDate(nextAvialableUpdate.getDate() + 14);
        break;
      case 'monthly':
        nextAvialableUpdate.setDate(nextAvialableUpdate.getDate() + 30);
        break;
      default:
        res.status(400).send('invalid frequency');
        return;
    }

      if(Date.now() < nextAvialableUpdate.getTime()){
      res.status(400).send(`you haven't waited long enough to track again`);
      return;
      }
    }
    
    habit.lastActivity = Date.now();
    habit.totalActivity.push(Date.now());
    habit.currentStreak++;
    if(habit.currentStreak > habit.longestStreak){
      habit.longestStreak = habit.currentStreak;
    }
    user.habits[habitIndex] = habit;
    const updatedUser = await user.save();
    res.send(user.habits[habitIndex]);
  })
      
  module.exports = router;
