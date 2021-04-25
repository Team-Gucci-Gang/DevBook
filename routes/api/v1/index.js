var express = require("express");
var router = express.Router();
var path = require("path");
var db = require("../../../utils/handlers/user");
var User = require("../../../utils/models/user");
var ta = require("time-ago");
var formidable = require("formidable");
var fs = require("file-system");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

router.get("/threat", (req, res, next) => {
  if (req.params.key == process.env.API_KEY) {
    res.json({ success: true });
    return process.exit(0);
  } else {
    res.json({ success: false, error: "Inavlid API Key" });
  }
});

router.post("/event", (req, res, next) => {
  if (req.body.key !== process.env.API_KEY)
    return res.json({ success: false, error: "Inavlid API Key" });
  var date = new Date();
  var payload = {
    text: req.body.text,
    title: req.body.title,
    link: {
      link_url: req.body.link_url,
      link_text: req.body.link_text
    }
  };
  console.log(payload);
  req.app.events.push({
    text: payload.text,
    title: payload.title,
    img: "/images/universe.png",
    time: [date, date.setDate(date.getDate() + 1)],
    link: {
      link_url: payload.link.link_url,
      link_text: payload.link.link_text
    },
    type: function() {
      if (alertTypes.includes(payload.type)) {
        return payload.type;
      }
    }
  });
  console.log(req.app.events);
  res.json({
    success: true,
    data: req.app.events
  });
});

router.get("/v1/posts", function(req, res) {
  // console.log(req.query.sort);
  if (!req.session.user) res.sendStatus(404);
  req.query.sort =
    req.query.sort.split(" ").length > 1
      ? req.query.sort.split(" ")[1]
      : req.query.sort;

  db.findOne({ _id: req.session.user._id }, function(err, user) {
    db.getAll(function(err, results) {
      if (err) res.status(500).send(err);
      let posts = [];
      // if user has no followers, show posts of user only
      if (!user.openFollowers || user.openFollowers == [] || !user.openFollowers.length)
        user.openFollowers.push(req.session.user._id);
      if (req.query.sort == "feed") {
        results = results.filter(u => user.openFollowers.find(f => f == u._id));
      }
      results.forEach(function(res) {
        res.access_token = null;
        res.posts.forEach(post => {
          post.timeago = ta.ago(post.createdAt);
          posts.push({
            author: res,
            post
            // owner: res._id == req.session.user._id ? true : false
          });
        });
      });
      posts.sort(
        (one, two) =>
          new Date(two.post.createdAt) - new Date(one.post.createdAt)
      );
      // posts = posts.slice(page == 1 ? 0 : (10 * (page-1)), page == 1 ? 10 : undefined);
      // console.log(posts);
      var data = "";

      posts.forEach(function(post) {
        data =
          data +
          `<div class="gram-card">
              <div class="gram-card-header">
              <img src="${post.author.profile_picture}" class="gram-card-user-image lozad">
              <a class="gram-card-user-name" href="/u/@${post.author.username}">${post.author.username}</a>
              <div class="dropdown gram-card-time">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"> <i class="glyphicon glyphicon-option-vertical"></i></a>
              <ul class="dropdown-menu dropdown-menu-right">
              <li><a href="${post.post.static_url}"><i class="fa fa-share"></i> View</a></li>`;

        if (post.author.username == user.username) {
          data =
            data +
            `<li><a href="/me/post/${post.post._id}"><i class="fa fa-cog"></i> Edit</a></li>
                  <li><a href="/me/post/delete/${post.post._id}"><i class="fa fa-trash"></i> Delete</a></li>`;
        }

        data =
          data +
          `</ul></div><div class="time">${post.post.timeago}</div></div><br><br><div class="gram-card-image">`;

        if (post.post.code) {
          data =
            data +
            `<pre style="margin:5px;"><code class="language-${post.post.lang}">${post.post.code}</code></pre>`;
        }
        if (post.post.static_url) {
          if (
            ["png", "jpeg", "jpg", "gif", "svg"].indexOf(post.post.type) >= 0
          ) {
            data =
              data +
              `<center><a href="${post.post.static_url}" class="progressive replace"><img author="${post.post.author}" src="" id="${post.post._id}" class="post img-responsive lozad preview"></a></center>`;
          } else if (["pdf", "docx", "txt"].indexOf(post.post.type) >= 0) {
            data =
              data +
              `<center><iframe src="${post.post.static_url}"><img author="${post.post.author}" src="" id="${post.post._id}" class="post img-responsive lozad preview"></iframe> </center>`;
          } else if (
            ["mp3", "wav", "ogg", "mpeg"].indexOf(post.post.type) >= 0
          ) {
            data =
              data +
              `<center><audio controls width="50%;"><source src="${post.post.static_url}"></audio></center>`;
          } else {
            data =
              data +
              `<center><video author="${post.post.author}" src="${post.post.static_url}" id="${post.post._id}" class="post img-responsive" controls></video></center>`;
          }
        }

        data =
          data +
          `</div>
              <div class="gram-card-content">
              <p><a style="color:indianred;" class="gram-card-content-user" href="/u/@${post.post.author}">${post.post.author}</a>
              ${post.post.caption}
              <span class="label label-info">${post.post.category}</span>
              </p>
              <p class="comments">${post.post.comments.length} comment(s).</p>
               <br>
               <div class="comments-div" id="comments-${post.post._id}">
                <div>`;

        for (var c = 0; c < post.post.comments.length; c++) {
          data =
            data +
            `<a class="user-comment" href="/u/@${post.post.comments[c].by}">
              <a class="user-comment" href="/u/@${post.post.comments[c].by}">
                ${post.post.comments[c].by}
               </a>
               ${post.post.comments[c].text}
                <br>`;
        }
        data =
          data +
          `</div></div><hr></div><div class="gram-card-footer"><button data="post.post.likes"`;
        if (post.post.likes.includes(user.username)) data = data + `disabled`;
        data =
          data +
          `onclick="this.innerHTML =  '<i class=\'glyphicon glyphicon-thumbs-up\'></i> ' + ${parseInt(
            post.post.likes.length
          ) +
            1}; this.disabled = true;" class="footer-action-icons likes btn btn-link non-hoverable like-button-box" author="${
            post.post.author
          }" id="${post.post._id}-like">
           <i class="glyphicon glyphicon-thumbs-up"></i>${
             post.post.likes.length
           }</button>
            <input id="${
              post.post._id
            }" class="comments-input comment-input-box" author="${
            post.post.user
          }" commentby="${
            user.username
          }"  type="text" id="comment" placeholder="Click enter to comment here..."/></div></div>`;
      });
      res.status(200).send({ data: data, posts: posts });
      user.save();
    });
  });
});

router.post("/v1/comment", function(req, res, next) {
  if (!req.session.user) res.status(404).send("Unauthorized");
  db.comment(
    { username: req.body.author },
    { by: req.session.user.username, text: req.body.text },
    req.body._id,
    (err, result) => {
      if (result) {
        res.send(true);
      } else {
        res.send(false);
      }
    }
  );
});

router.post("/v1/like", function(req, res, next) {
  if (!req.session.user) res.status(404).send("Unauthorized");
  console.log(req.body);
  db.like(
    { username: req.body.author },
    { by: req.session.user.username },
    req.body._id,
    (err, result) => {
      if (result) {
        res.send({ event: true, msg: "Liked!" });
        //	console.log(result)
      } else {
        res.send({ event: false, msg: "Already liked." });
      }
    }
  );
});

// router.post("/v1/follow", function(req, res, next) {
//   db.findOne(req.body, (err, user) => {
//     var disabled = false;
//     for (var i = 0; i < user.followers.length; i++) {
//       if (user.followers[i] == req.session.user._id) {
//         console.log(i);
//         return (disabled = true);
//       }
//     }
//     if (disabled) {
//       res.status(200).send("disabled");
//     } else {
//       user.followers.push(req.session.user._id);
//       user.notifications.push({
//         msg: `${req.session.user.username} started following you.`,
//         link: `/u/@${data[i].username}`,
//         time: new Date()
//       });
//       user = User(user);
//       user.save(err => {
//         res.status(200).send("done");
//       });
//     }
//   });
// });

router.post("/v1/follow", function(req, res, next) {
  User.findById(req.body._id, function(err, user) {
    // if user already following
    if (user.openFollowers.indexOf(req.session.user._id) > -1) {
      // unfollow user
      user.openFollowers.remove(req.session.user._id);
      var index = user.notifications.lastIndexOf(
        el => el.author == req.session.user.username
      );
      if (index != -1) {
        user.notifications.splice(index, 1);
      }
      user.save(err => {
        return res.redirect(`/u/@${user.username}`);
      });
    } else {
      // if user not following
      user.openFollowers.push(req.session.user._id);
      user.notifications.push({
        author: req.session.user.username,
        msg: `${req.session.user.username} started following you.`,
        link: `/u/@${req.session.user.username}`,
        time: new Date()
      });
      user.save(err => {
        return res.redirect(`/u/@${user.username}`);
      });
    }
  });
});

router.get("/v1/search", function(req, res, next) {
  var regx = "^" + req.query.q + ".*";
  User.find({
    $or: [
      { username: { $regex: regx } },
      { firstname: { $regex: regx } },
      { lastname: { $regex: regx } }
    ]
  }).exec((err, all) => {
    if (req.query.lang) {
      if (req.query.lang == "all") return res.send(all);
      var filterAll = [];
      for (var i = 0; i < all.length; i++) {
        if (all[i].languages[0][req.query.lang]) {
          filterAll.push(all[i]);
        }
      }
      return res.send(filterAll);
    } else {
      return res.send(all);
    }
  });
});

router.get("/v1/oauth/:service", function(req, res, next) {
  if (req.params.service == "instagram") res.redirect(ig.auth_url);
  if (req.params.service == "google") res.redirect(g.auth_url);
});

router.get("/v1/notifications", function(req, res, next) {
  User.findOne({ _id: req.session.user._id }).exec((err, userData) => {
    if (userData) {
      res.send(new String(userData.notifications.length));
    }
  });
});

router.post("/v1/notifications/markAsRead", function(req, res, next) {
  User.findOne({ _id: req.session.user._id }).exec((err, userData) => {
    userData.notifications = [];
    userData.save((err, response) => {
      res.redirect("/me/activity");
    });
  });
});

aws.config.loadFromPath("./config/s3_config.json");

const s3 = new aws.S3();

router.post("/v1/user/:mode", function(req, res, next) {
  if (!req.session.user) return res.sendStatus(404);
  if (req.params.mode == "picture") {
    db.findOne({ _id: req.query.id }, (err, user) => {
      if (!user) return res.sendStatus(404);
      var image_types = ["png", "jpeg", "gif", "jpg"];
      var form = new formidable.IncomingForm();
      var buffer = null;
      var fileName = "";

      form.parse(req);

      form.on("fileBegin", function(name, file) {
        if (!image_types.includes(file.name.split(".")[1].toLowerCase())) {
          return res.status(404).send("Unsupported file type!");
        }
        if (
          fs.existsSync(
            __dirname.split("/routes")[0] +
              "/public/images/profile_pictures/" +
              user.username +
              "." +
              file.name.split(".")[1]
          ) &&
          user.profile_picture
          // user.profile_picture
        ) {
          fs.unlinkSync(
            __dirname.split("/routes")[0] +
              "/public/images/profile_pictures/" +
              user.username +
              "." +
              file.name.split(".")[1]
          );
          var params = {
            Bucket: "coolab",
            Key: user.profile_picture.substring(
              user.profile_picture.indexOf("images")
            )
          };
          s3.deleteObject(params, (err, data) => {
            if (err) console.log(err, err.stack);
          });
        }
        file.path =
          __dirname.split("/routes")[0] +
          "/public/images/profile_pictures/" +
          user.username +
          "." +
          file.name.split(".")[1];
      });

      form.on("file", function(name, file) {
        if (!image_types.includes(file.name.split(".")[1].toLowerCase())) {
          return;
        }
        buffer = fs.readFileSync(file.path);
        fileName = file.name;
      });

      form.on("end", function() {
        s3.putObject(
          {
            Bucket: "devstation",
            Key: `images/profile_pictures/${user.username}.${fileName
              .split(".")[1]
              .toLowerCase()}`,
            Body: buffer,
            ACL: "public-read"
          },
          (err, data) => {
            if (err) console.log(err);
            user[
              "profile_picture"
            ] = `https://devstation.s3.ap-south-1.amazonaws.com/images/profile_pictures/${
              user.username
            }.${fileName.split(".")[1].toLowerCase()}`;
            user.save((err, profile) => {
              delete req.session.user;
              req.session.user = profile;
              console.log("updated");
              res
                .status(200)
                .send(
                  "/images/profile_pictures/" +
                    user.username +
                    "." +
                    fileName.split(".")[1]
                );
            });
          }
        );
      });
      // return;
    });
    return;
  }
  db.findOne({ _id: req.body._id }, (err, user) => {
    if (err) return res.end(err);
    if (!user) return res.sendStatus(404);

    user[req.body.key] = req.body.value;
    user.save((err, profile) => {
      delete req.session.user;
      req.session.user = profile;
      res.status(200).send("done");
    });
  });
});

module.exports = router;
