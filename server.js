require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
//import helpers
const {isAuth} = require('./helpers/authHelpers');
app.use(express.json());
if(process.env.NODE_ENV !== 'test'){
    mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(() => {
    console.log("connected");
  })
  .catch((e) => {
    console.error(e);
  });
};
app.use((req,res,next) =>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, token');
  if(req.method ==='OPTIONS'){
    return res.sendStatus(200);
  }
  next();
});

//default landing route
app.get("/", (req, res) => {
  res.status(200).send("hello world");
});

//creating a home for our registation and autorization things to live
const authRoute = require("./routes/auth");
app.use("/api/user", authRoute);
//ALL ROUTES BELOW THIS POINT WILL REQUIRE AUTH!!!
app.use(isAuth);
//habit routes
const habitRoute = require("./routes/habits");
app.use("/api/habits", habitRoute);
app.listen(process.env.PORT, () => {
  console.log("listening on 3000");
});
module.exports = app;
