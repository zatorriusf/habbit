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

describe("User Register and Login Tests", function () {
 
  describe(`Testing /api/user/register endpoint`, function () {
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
    it("#creating new user", function (done) {
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

    it("#logging in our new user", function (done) {
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
  });
});
