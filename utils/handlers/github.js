const GitHubStrategy = require("passport-github").Strategy;
const passport = require("passport");
const User = require("../models/user");
const github = require("./githubresume");

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  // Find or create a user
  return done(null, {});
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      callbackURL:
        process.env.GITHUB_REDIRECT ||
        "http://localhost:8080/auth/github/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOne({ id: profile.id }).exec((err, dbUser) => {
        if (dbUser) return cb(null, dbUser);
        console.log("New user!");
        profile.access_token = accessToken;
        github(profile, (data) => {
          var newUser = new User({
            id: profile.id,
            username: profile.username,
            profile_url: profile.profileUrl,
            email: profile._json.email,
            profile_picture: profile._json.avatar_url,
            name: profile._json.name,
            firstname: profile._json.name.split(" ")[0],
            lastname: profile._json.name.split(" ")[1],
            website: profile._json.blog,
            location: profile._json.location,
            hirable: profile._json.hirable,
            bio: profile._json.bio,
            since: data.profile.since,
            created_at: data.profile.created_at,
            repos: data.repos,
            languages: data.languages,
            gists: profile._json.public_gists,
            user_status: data.profile.userStatus,
            new: data.profile.earlyAdopter,
            openFollowers: [],
            followers: profile._json.followers,
            following: profile._json.following,
            access_token: accessToken,
            refresh_token: refreshToken,
            notifications: [],
          });
          console.log(newUser.openFollowers);
          newUser.save((err, done) => {
            if (err) return cb(err);
            if (done) return cb(null, done);
          });
        });
      });
    }
  )
);
