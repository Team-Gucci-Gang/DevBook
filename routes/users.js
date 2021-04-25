var express = require("express");
var router = express.Router();
var path = require("path");
var db = require("../utils/handlers/user");
var textParser = require("../utils/text-parser");
var formParser = require("../utils/form-parser");

/* GET users listing. */
router.get("/", function(req, res, next) {
  db.getAll((err, users) => {
    var index = users.findIndex(user => user._id == req.session.user._id);
    users.splice(index, 1);
    res.render("user/list", {
      title: req.app.conf.name,
      list: users
    });
  });
});

router.get("/@:username", function(req, res, next) {
  db.findOne({ username: req.params.username }, (err, user) => {
    if (!user) return res.status(404).send("No user found");
    user.bio = textParser(user.bio);
    res.render("user/profile", {
      title: req.app.conf.name,
      u: user,
      userId: req.session.user._id,
      username: req.session.user.username
    });
  });
});
module.exports = router;
