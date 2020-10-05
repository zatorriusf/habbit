process.env.NODE_ENV = "test";

const jwt = require("jsonwebtoken");
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
    desc: "test description",
    frequency: "monthly",
  };
  //object to hold the result from the good habit post
  let goodHabitReturn;
  let token;
  before(async function () {
    await mongoose.connect(process.env.TEST_MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await User.deleteMany();
    const user = await new User(testUser).save();
    goodTestHabit.userId = user._id;
    token = jwt.sign({ userId: user._id }, process.env.JWT_TOKEN_SECRET);
  });

  describe("##creating habits", function () {
    it(`post valid habits`, function (done) {
      chai
        .request(server)
        .post("/api/habits")
        .set("token", token)
        .send(goodTestHabit)
        .end(function (err, res) {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an("object");
          expect(res.body)
            .to.have.property("title")
            .and.equal(goodTestHabit.title);
          expect(res.body)
            .to.have.property("desc")
            .and.equal(goodTestHabit.desc);
          expect(res.body)
            .to.have.property("frequency")
            .and.equal(goodTestHabit.frequency);
          expect(res.body).to.have.property("totalActivity").and.to.be.an("array");

          goodHabitReturn = res.body;

          done();
        });
    });
    describe("###bad habit validation check", function () {
      it("no token present in header", function (done) {
        const noUserIdHabit = {
          title: "we're doing a bad thing",
          frequency: "monthly",
        };
        chai
          .request(server)
          .post("/api/habits")
          .send(noUserIdHabit)
          .end(function (err, res) {
            expect(res.status).to.equal(400);
            expect(res.text).to.equal("Unable to Authenticate user");
            done();
          });
      });
      it("invalid frequency present in request", function (done) {
        const invalidFrequencyHabit = {
          title: `we're doing a bad thing`,
          frequency: "bi-monthly",
          desc: 'this should totes fail'
        };
        chai
          .request(server)
          .post("/api/habits")
          .set("token", token)
          .send(invalidFrequencyHabit)
          .end(function (err, res) {
            expect(res.status).to.equal(400);
            done();
          });
      });
      it("no frequency present in request", function (done) {
        const noFrequencyHabit = {
          title: `we're doing a bad thing`,
          desc: 'this should totes fail'
        };
        chai
          .request(server)
          .post("/api/habits")
          .set("token", token)
          .send(noFrequencyHabit)
          .end(function (err, res) {
            expect(res.status).to.equal(400);
            done();
          });
      });
      it("no title present in request", function (done) {
        const noTitleHabit = {
          frequency: "bi-monthly",
          desc: 'this should totes fail'
        };
        chai
          .request(server)
          .post("/api/habits")
          .set("token", token)
          .send(noTitleHabit)
          .end(function (err, res) {
            expect(res.status).to.equal(400);
            done();
          });
      });
      it("no description present in request", function (done) {
        const noDescriptionHabit = {
          frequency: "bi-weekly",
          title: "bad habi"
        };
        chai
          .request(server)
          .post("/api/habits")
          .set("token", token)
          .send(noDescriptionHabit)
          .end(function (err, res) {
            expect(res.status).to.equal(400);
            done();
          });
      });
    });
  });
  describe(`##bringing back the habits`, function () {
    it(`get habits`, function (done) {
      chai
        .request(server)
        .get("/api/habits")
        .set("token", token)
        .end(function (err, res) {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an("array");
          done();
        });
    });
    describe("###failing habit get", function () {
      it("missing token", function (done) {
        chai
          .request(server)
          .get("/api/habits")
          .send({ userId: null })
          .end(function (err, res) {
            expect(res.status).to.equal(400);
            expect(res.text).to.equal("Unable to Authenticate user");
            done();
          });
      });
    });
  });
  describe("##Updating an existing habit", function () {
    it("updating title", function (done) {
      const updateTitleObj = {
        habitId: goodHabitReturn._id,
        title: "Updated title via Test",
        frequency: goodHabitReturn.frequency,
        desc: goodHabitReturn.desc
      };
      chai
        .request(server)
        .patch("/api/habits")
        .set("token",token)
        .send(updateTitleObj)
        .end(function (err, res) {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an("object");
          expect(res.body)
            .to.have.property("title")
            .and.not.equal(goodHabitReturn.title);
          expect(res.body)
            .to.have.property("frequency")
            .and.equal(goodHabitReturn.frequency);
          expect(res.body)
            .to.have.property("desc")
            .and.equal(goodHabitReturn.desc);
          done();
        });
    });
    it("updating description", function (done) {
      const updateDescriptionObj = {
        habitId: goodHabitReturn._id,
        title: goodHabitReturn.title,
        frequency: goodHabitReturn.frequency,
        desc : 'great update'
      };
      chai
        .request(server)
        .patch("/api/habits")
        .set("token",token)
        .send(updateDescriptionObj)
        .end(function (err, res) {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an("object");
          expect(res.body)
            .to.have.property("title")
            .and.equal(goodHabitReturn.title);
          expect(res.body)
            .to.have.property("frequency")
            .and.equal(goodHabitReturn.frequency);
          expect(res.body)
            .to.have.property("desc")
            .and.equal('great update');
          done();
        });
    });
    it("updating frequency to daily", function (done) {
      const updateFrequencyObj = {
        habitId: goodHabitReturn._id,
        title: goodHabitReturn.title,
        frequency: "daily",
        desc : goodHabitReturn.desc
      };
      chai
        .request(server)
        .patch("/api/habits")
        .set("token",token)
        .send(updateFrequencyObj)
        .end(function (err, res) {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an("object");
          expect(res.body)
            .to.have.property("title")
            .and.equal(goodHabitReturn.title);
          expect(res.body)
            .to.have.property("frequency")
            .and.not.equal(goodHabitReturn.frequency);
          expect(res.body)
            .to.have.property("desc")
            .and.equal(goodHabitReturn.desc);
          done();
        });
    });
    describe("###Fail checks", function () {
      it("missing habitId", function (done) {
        const failedupdate1 = {
          habitId: null,
          title: "Updated title via Test",
          frequency: goodHabitReturn.frequency,
        };
        chai
          .request(server)
          .patch("/api/habits")
          .set("token",token)
          .send(failedupdate1)
          .end(function (err, res) {
            expect(res.status).to.equal(400);
            expect(res.text).to.equal("invalid request");
            done();
          });
      });
      it("missing title", function (done) {
        const failedupdate1 = {
          habitId: goodHabitReturn._id,
          title: null,
          frequency: goodHabitReturn.frequency,
        };
        chai
          .request(server)
          .patch("/api/habits")
          .set("token",token)
          .send(failedupdate1)
          .end(function (err, res) {
            expect(res.status).to.equal(400);
            expect(res.text).to.equal("invalid request");
            done();
          });
      });
      it("missing frequency", function (done) {
        const failedupdate1 = {
          habitId: goodHabitReturn._id,
          title: "Updated title via Test",
          frequency: null,
        };
        chai
          .request(server)
          .patch("/api/habits")
          .set("token",token)
          .send(failedupdate1)
          .end(function (err, res) {
            expect(res.status).to.equal(400);
            expect(res.text).to.equal("invalid request");
            done();
          });
      });
    });
  });
  describe("##Testing Habit Tracking", function () {
    it("successful tracking", function (done) {
      chai
        .request(server)
        .patch("/api/habits/track")
        .set("token",token)
        .send({ habitId: goodHabitReturn._id })
        .end(function (err, res) {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("totalActivity")
            .and.to.be.an('array');
          done();
        });
    });
    describe("###Tracking fail cases", function () {
      it("tracking before the frequency has passed", function (done) {
        chai
          .request(server)
          .patch("/api/habits/track")
          .set("token",token)
          .send({ habitId: goodHabitReturn._id })
          .end(function (err, res) {
            expect(res.status).to.equal(400);
            expect(res.text).to.equal(
              `you haven't waited long enough to track again`
            );
            done();
          });
      });
      it("Missing habitId", function (done) {
        chai
          .request(server)
          .patch("/api/habits/track")
          .set("token",token)
          .send({ habitId: null })
          .end(function (err, res) {
            expect(res.status).to.equal(400);
            expect(res.text).to.equal("invalid request");
            done();
          });
      });
    });
  });
  describe("##Testing Habit Deletes", function () {
    describe("###Delete fails", function () {
      it("no ids passed", function (done) {
        chai
          .request(server)
          .delete("/api/habits")
          .set("token",token)
          .send({
            userId: goodTestHabit.userId,
            habitIds: [],
          })
          .end(function (err, res) {
            expect(res.status).to.equal(400);
            expect(res.text).to.equal("invalid request");
            done();
          });
      });
    });
    describe("###successfuly delete", function () {
      it(`let's delete a habit`, function (done) {
        const deleteObj = {
          habitIds: [goodHabitReturn._id],
        };
        chai
          .request(server)
          .delete("/api/habits")
          .set("token",token)
          .send({
            userId: goodTestHabit.userId,
            habitIds: [goodHabitReturn._id],
          })
          .end(function (err, res) {
            expect(res.status).to.equal(200);
            expect(res.text).to.equal(
              `${deleteObj.habitIds.length} habit(s) removed`
            );
            done();
          });
      });
    });
  });
});
