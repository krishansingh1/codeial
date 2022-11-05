const passport = require("passport");

const LocalStrategy = require("passport-local").Strategy;

const User = require("../models/user");

//authentication using passport
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    function (req, email, password, done) {
      //find a user and establish the identity
      User.findOne({ email: email }, function (err, user) {
        if (err) {
          // console.log("Error in finding user ---> Passport");
          req.flash("error", err);
          return done(err);
        }

        if (!user || user.password != password) {
          // console.log("Invalid UserName/Password");
          req.flash("error", "Invalid UserName/Password");
          return done(null, false);
        }

        return done(null, user);
      });
    }
  )
);

// Serialize the user to decide which key is to be kept in the cokkies

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// deseralizing the user from the key in the cokkies
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    if (err) {
      console.log("Error in finding a user");
      return done(err);
    }

    return done(null, user);
  });
});

//check if the user is authenticated

passport.checkAuthentication = function (req, res, next) {
  //if the user is signed in, then pass on the request to the next function(controller's action)
  if (req.isAuthenticated()) {
    return next();
  }
  //if the user is not signed in
  return res.redirect("/users/signIn");
};

passport.setAuthenticatedUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
};

module.exports = passport;
