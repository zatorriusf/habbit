process.env.NODE_ENV = "test";

const chaiHttp = require("chai-http");
const mocha = require("mocha");
const chai = require("chai"),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

const server = require("../server");
const mongoose = require("mongoose");
const User = require("../models/user");

chai.use(chaiHttp);

describe("#User Register and Login Tests", function () {
  before(function (done) {
    mongoose
      .connect(process.env.TEST_MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("connected for testing");
      })
      .catch((e) => {
        console.error(e);
      });
    User.deleteMany({}, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("purged the user table");
      }
    });
    done();
  });
  const user = {
    email: "user1@test.com",
    password: "test12345",
  };
  describe(`##Testing /api/user/register endpoint`, function () {
    it("creating new user", function (done) {
      chai
        .request(server)
        .post("/api/user/register")
        .send(user)
        .end(function (err, res) {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("email").and.equal(user.email);
          done();
        });
    });
    describe("###Fail cases for register",function(){
      it("invalid email address", function(done){
        const badEmailUser ={
          email: "testbad.com",
          password : "pass12345"
        };
        chai
          .request(server)
          .post("/api/user/register")
          .send(badEmailUser)
          .end(function(err,res){
            expect(res.status).to.equal(400);
            expect(res.text).to.equal('cannot create account with given information');
            done();
          });
      });
      it('password too short', function(done){
        const shortPasswordUser = {
          email : "validemail@email.com",
          password : "Seven"
        }

        chai
          .request(server)
          .post("/api/user/register")
          .send(shortPasswordUser)
          .end(function(err,res){
            expect(res.status).to.equal(400);
            expect(res.text).to.equal('cannot create account with given information');
            done();
          });
      });
      it('email address has already been used', function(done){
        chai
        .request(server)
        .post("/api/user/register")
        .send(user)
        .end(function (err, res) {
          expect(res.status).to.equal(400);
          expect(res.text).to.equal("cannot use this email");
          done();
        });
      })
    })
  describe('##Testing /api/user/login endpoint',function(){
    it("logging in our new user", function (done) {
      chai
        .request(server)
        .post("/api/user/login")
        .send(user)
        .end(function (err, res) {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("email").and.equal(user.email);
          expect(res.body).to.have.property("token");
          done();
        });
    });
    describe('###Login Fail cases', function(){
      it("email invalid",function(done){
        const badEmailUser ={
          email: "testbad.com",
          password : "pass12345"
        };
        chai
          .request(server)
          .post("/api/user/login")
          .send(badEmailUser)
          .end(function(err,res){
            expect(res.status).to.equal(400);
            expect(res.text).to.equal('invalid login information');
            done();
          });
      });
      it("password too short",function(done){
        const badPasswordUser ={
          email: "test@bad.com",
          password : "pass1"
        };
        chai
          .request(server)
          .post("/api/user/login")
          .send(badPasswordUser)
          .end(function(err,res){
            expect(res.status).to.equal(400);
            expect(res.text).to.equal('invalid login information');
            done();
          });
      });
      it("password invalid",function(done){
        const wrongPasswordUser ={
          email: "user1@test.com",
          password: "test12346",
        };
        chai
          .request(server)
          .post("/api/user/login")
          .send(wrongPasswordUser)
          .end(function(err,res){
            expect(res.status).to.equal(400);
            expect(res.text).to.equal('invalid username or password');
            done();
          });
      });
      it("email not found",function(done){
        const emailNotRegistered ={
          email: "user21@test.com",
          password: "test12346",
        };
        chai
          .request(server)
          .post("/api/user/login")
          .send(emailNotRegistered)
          .end(function(err,res){
            expect(res.status).to.equal(400);
            expect(res.text).to.equal('invalid username or password');
            done();
          });
      });
    });
  });

  });
});
