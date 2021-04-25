var express = require("express");
var router = express.Router();
var user = require("../utils/handlers/user");
var array_tools = require("array-tools");
var ta = require("time-ago");
// const Prism = require('prismjs');

router.get("/", function(req, res, next) {
  if (req.session.user) {
    user.findBy({id:{ $ne: req.session.user.id }},(err, users) => {
      user.findOne({ id: req.session.user.id }, (error, req_user) => {
        req.app.events.map((a, b) => {
          if (a.time[1] < new Date()) {
            req.app.events.slice(a);
          }
        });

        var people = users;
        users.push(req_user);
        var postList = [];
        for (var u of users) {
          for (var post of u.posts) {
            post.timeago = ta.ago(post.createdAt);
            postList.push({ author: u, post: post });
          }
        }
        postList.sort(
          (one, two) =>
            new Date(two.post.createdAt) - new Date(one.post.createdAt)
        );

        res.render("index", {
          user: req_user,
          title: req.app.conf.name,
          people: people,
          postList: postList,
          events: req.app.events,
          where: "/"
        });
      });
    });
  } else {
    res.render("land", {
      title: req.app.conf.name,
      error: false
    });
  }
});

module.exports = router;
