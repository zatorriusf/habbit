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
const testUser = {
  email: "user1@test.com",
  password: "test12345",
};

chai.use(chaiHttp);

describe("#Testing habit routes and such", function () {
  const goodTestHabit = {
    title: "test",
    frequency: "daily",
    userId: null,
  };
  before(async function () {
    await mongoose.connect(process.env.TEST_MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await User.deleteMany();
    const user = await new User(testUser).save();
    goodTestHabit.userId = user._id;
  });
  describe("##creating habits", function () {
    it(`post valid habits`, function (done) {
      chai
        .request(server)
        .post("/api/habits")
        .send(goodTestHabit)
        .end(function (err, res) {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an("object");
          expect(res.body)
            .to.have.property("title")
            .and.equal(goodTestHabit.title);
          expect(res.body)
            .to.have.property("frequency")
            .and.equal(goodTestHabit.frequency);
          expect(res.body).to.have.property("totalActivity").and.equal(0);
          done();
        });
    });

    describe("###bad habit validation check", function () {
      it("no userId present in request", function (done) {
        const noUserIdHabit = {
          title: "we're doing a bad thing",
          frequency: "monthly"
        };
        chai
          .request(server)
          .post("/api/habits")
          .send(noUserIdHabit)
          .end(function (err, res) {
            expect(res.status).to.equal(400);
            expect(res.text).to.equal('invalid request');
            done();
          });
      });
      it("invalid frequency present in request", function (done) {
        const noUserIdHabit = {
          title: `we're doing a bad thing`,
          frequency: "bi-monthly",
          userId: goodTestHabit.userId,
        };
        chai
          .request(server)
          .post("/api/habits")
          .send(noUserIdHabit)
          .end(function (err, res) {
            expect(res.status).to.equal(400);
            done();
          });
      });
      it("no frequency present in request", function (done) {
        const noUserIdHabit = {
          title: `we're doing a bad thing`,
          userId: goodTestHabit.userId
        };
        chai
          .request(server)
          .post("/api/habits")
          .send(noUserIdHabit)
          .end(function (err, res) {
            expect(res.status).to.equal(400);
            done();
          });
      });
      it("no frequency present in request", function (done) {
        const noUserIdHabit = {
          title: `we're doing a bad thing`,
          userId: goodTestHabit.userId
        };
        chai
          .request(server)
          .post("/api/habits")
          .send(noUserIdHabit)
          .end(function (err, res) {
            expect(res.status).to.equal(400);
            done();
          });
      });
      it("no title present in request", function (done) {
        const noUserIdHabit = {
          frequency: "bi-monthly",
          userId: goodTestHabit.userId
        };
        chai
          .request(server)
          .post("/api/habits")
          .send(noUserIdHabit)
          .end(function (err, res) {
            expect(res.status).to.equal(400);
            done();
          });
      });
    });
  });
  describe(`##bringing back the habits`,function(){
    const {userId} = goodTestHabit;
    it(`get habits`, function (done) {
      console.log(goodTestHabit.userId)
      chai
        .request(server)
        .get("/api/habits")
        .send({userId : goodTestHabit.userId})
        .end(function (err, res) {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });
  })
});
