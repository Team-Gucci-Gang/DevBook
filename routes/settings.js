var express = require("express");
var router = express.Router();
var path = require("path");
var guid = require("guid");
var mv = require("mv");
const mime = require("mime-types");
var db = require("../utils/models/user");
var formParser = require("../utils/form-parser.js");
const fs = require("file-system");
const multer = require("multer");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");

var file_types = ["png", "jpeg", "gif", "jpg", "mov", "mp4"];

/* GET users listing. */

router.get("/", function(req, res, next) {
  res.redirect("/u/@" + req.session.user.username);
});

router.get("/settings", function(req, res, next) {
  db.findOne({ _id: req.session.user._id }).exec((err, user) => {
    res.render("me/settings", {
      title: req.app.conf.name,
      user: user
    });
  });
});

router.post("/delete", function(req, res, next) {
  var delete_id = req.session.user._id;
  req.session.destroy(() => {
    db.deleteOne({ _id: delete_id }, err => {
      res.redirect("/?action=delete");
    });
  });
});

router.get("/activity", function(req, res, next) {
  db.findOne({ _id: req.session.user._id }).exec((err, user) => {
    res.render("me/activity", {
      title: req.app.conf.name,
      activity: user.notifications
    });
  });
});

router.get("/upload", function(req, res, next) {
  res.render("upload/file-upload", {
    title: req.app.conf.name,
    user: req.session.user
  });
});

AWS.config.loadFromPath('./config/s3_config.json');

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "devstation",
    acl: "public-read",
    key: function(req, file, cb) {
      cb(
        null,
        `feeds/${
          req.session.user.username
        }_${Date.now()}.${file.originalname
          .split(".")
          [file.originalname.split(".").length - 1].toLowerCase()}`
      );
    }
  })
});

router.post("/upload", upload.single("filetoupload"), (req, res, next) => {
  var random_id = guid.raw();
  db.findOne({ id: req.session.user.id }).exec((err, u) => {
    u.posts.push({
      _id: random_id,
      author: req.session.user.username,
      authorID: req.session.user.id,
      static_url: (req.file) ? req.file.location : null,
      caption: req.body.caption,
      category: req.body.type,
      comments: [],
      likes: [],
      type: (req.file) ? (req.file.originalname
        .split(".")
        [req.file.originalname.split(".").length - 1].toLowerCase()) : null,
      createdAt: new Date(),
      lastEditedAt: new Date()
    });
    u = new db(u);
    u.save(err => {
      if (err) throw err;
      console.log("Post saved");
      // Redirect back after the job is done.
      res.redirect("/");
    });
  });
});

router.get("/post/:action/:query", function(req, res, next) {
  switch (req.params.action) {
    case "edit":
      res.render("index");
      break;
    case "delete":
      {
        db.findOne({ id: req.session.user.id }).exec((err, u) => {
          let id = req.params.query;
          var index = u.posts.indexOf(u.posts.find(x => x._id == id));
          if (!u.posts[index]) {
            return res.redirect("/");
          }
          console.log(u);
          if (
            u.posts[index] &&
            u.posts[index].static_url
          )
            try {
              // fs.unlinkSync(
              //   "./public" +
              //     u.posts[u.posts.indexOf(u.posts.find(x => x._id == id))]
              //       .static_url
              // );
              let params = {
                Bucket: "devstation",
                Key: u.posts[index].static_url.substring(u.posts[index].static_url.indexOf("feeds"))
              };
              s3.deleteObject(params,(err,data) => {
                if(err) console.log(err,err.stack)
              });
            } catch (err) {}
          u.posts.splice(index, 1);
          u.save(err => {
            if (err) throw err;
            console.log("Post deleted");
            res.redirect("/");
          });
        });
      }
      break;
    default:
      res.send("What are you trynna do? (-_-)");
  }
});

/* Multer works!!!
const storage = multer.diskStorage({
  destination: path.join(__dirname,`../public/feeds`),
  filename: function(req,file,cb) {
    cb(null,`${req.session.user.username}_${Date.now()}.${file.originalname.split(".")[file.originalname.split(".").length-1].toLowerCase()}`);
  }
})

const upload = multer({storage:storage});

router.post("/upload",upload.single("filetoupload"),function(req,res,next) {
  var random_id = guid.raw();
  db.findOne({ id: req.session.user.id }).exec((err, u) => {
        u.posts.push({
          _id: random_id,
          author: req.session.user.username,
          authorID: req.session.user.id,
          static_url: '/feeds/' + req.file.filename,
          caption: req.body.caption,
          category: req.body.type,
          comments: [],
          likes: [],
          type: req.file.originalname.split(".")[req.file.originalname.split(".").length-1].toLowerCase(),
          createdAt: new Date(),
          lastEditedAt: new Date()
        });
        u = new db(u);
        u.save(err => {
          if (err) throw err;
          console.log("Post saved");
          // Redirect back after the job is done.
          res.redirect("/");
        })
      });
})
*/

/* Normal file upload
router.post("/upload", formParser, function(req, res, next) {
  // Generate a random id
  var random_id = guid.raw();
  if (req.files.filetoupload.name) {
    // Assign static_url path
    var oldpath = req.files.filetoupload.path;
    console.log(req.files.filetoupload.name);
    var type = req.files.filetoupload.name
      .split(".")
      [req.files.filetoupload.name.split(".").length - 1].toLowerCase();
    console.log(type);
    var newpath = path.join(
      __dirname,
      `../public/feeds/${req.session.user.username}_${random_id}.${type}`
    );
    var final_location = `/feeds/${req.session.user.username}_${random_id}.${type}`;

    console.log(
      `${oldpath} - OldPath\n ${newpath} - Newpath\n ${final_location} - DiskLocation\n`
    );
    // Finally upload the file to disk and save the feed to users profile.
    var type = mime.lookup(req.files.filetoupload.name).split("/")[1];
    mv(oldpath, newpath, function(err) {
      console.log("moving files");
    });
  } else {
    final_location = null;
  }
  db.findOne({ id: req.session.user.id }).exec((err, u) => {
    u.posts.push({
      _id: random_id,
      author: req.session.user.username,
      authorID: req.session.user.id,
      static_url: final_location,
      caption: req.body.caption,
      category: req.body.type,
      comments: [],
      likes: [],
      type: type,
      createdAt: new Date(),
      lastEditedAt: new Date()
    });
    u = new db(u);
    u.save(err => {
      if (err) throw err;
      console.log("Post saved");
      // Redirect back after the job is done.
      res.redirect("/");
    });
  });
});

*/

router.post("/upload/code", (req, res, next) => {
  var random_id = guid.raw();
  console.log(req.body);
  if (req.body.code) {
    db.findOne({ username: req.session.user.username }).exec(function(
      err,
      user
    ) {
      user.posts.push({
        _id: random_id,
        author: req.session.user.username,
        authorID: req.session.user.id,
        code: req.body.code,
        lang: req.body.lang,
        comments: [],
        caption: req.body.caption,
        likes: [],
        createdAt: new Date(),
        lastEditedAt: new Date()
      });
      user.save(err => {
        if (err) throw err;
        // Redirect back after the job is done.
        res.redirect("/");
      });
    });
  }
});

module.exports = router;
