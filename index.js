const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const gkeys = require("./googlekeys.json");
const unirest = require("unirest");
const app = express();

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(bodyParser.json());

const timer = require("timers");

app.listen(3001, function () {
  console.log("App listening on port 3001.");
});

app.post("/", function (req, res) {
  console.log("someone pinged @");
  let count = 0;
  timer.setInterval(function () {
    postMessage((count += 1));
  }, 60000);
  if (req.body.type === "MESSAGE") {
    return res.json({
      text: "sleeping...",
    });
  } else {
    return res.json({
      text: "khalid testing...",
    });
  }
});

function getJWT() {
  return new Promise(function (resolve, reject) {
    let jwtClient = new google.auth.JWT(
      gkeys.client_email,
      null,
      gkeys.private_key,
      ["https://www.googleapis.com/auth/chat.bot"]
    );

    jwtClient.authorize(function (err, tokens) {
      if (err) {
        console.log("Error create JWT hangoutchat");
        reject(err);
      } else {
        resolve(tokens.access_token);
      }
    });
  });
}

function postMessage(count) {
  return new Promise(function (resolve, reject) {
    getJWT()
      .then(function (token) {
        unirest
          .post("https://chat.googleapis.com/v1/spaces/AAAAAj8biQE/messages")
          .headers({
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          })
          .send(
            JSON.stringify({
              text: "Hello! This is message number " + count,
            })
          )
          .end(function (res) {
            resolve();
          });
      })
      .catch(function (err) {
        reject(err);
      });
  });
}
