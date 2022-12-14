const User = require("../models/user");
const fs = require("fs");
const path = require("path");

module.exports.profile = function (req, res) {
  User.findById(req.params.id, function (err, user) {
    return res.render("profile", {
      title: "Profile",
      profile_user: user,
    });
  });
};

module.exports.update = async function (req, res) {

  if (req.user.id == req.params.id) {
    try {
      let user = await User.findById(req.params.id);
      User.uploadedAvatar(req, res, function (err) {
        if (err) {
          console.log("****Multer Error:", err);
        }

        user.name = req.body.name;
        user.email = req.body.email;

        if (req.file) {
          if (user.avatar) {
            fs.unlinkSync(path.join(__dirname, "..", user.avatar));
          }

          //this is saving the path of the uploaded file into the avatar field in the user
          user.avatar = User.avatarPath + "/" + req.file.filename;
        }
        user.save();
        return res.redirect("back");
      });
    } catch {
      req.flash("error", err);
      return res.redirect("back");
    }
  } else {
    req.flash("error", "Unauthorized!");
    return res.status(401).send("Unauthorized");
  }
};

module.exports.signUp = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/profile");
  }

  return res.render("signUp", {
    title: "Codeial | SignUp",
  });
};

module.exports.signIn = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/profile");
  }

  return res.render("signIn", {
    title: "Codeial | SignIn",
  });
};

module.exports.create = function (req, res) {
  if (req.body.password != req.body.confirm_password) {
    req.flash("error", "Passwords do not match");
    return res.redirect("back");
  }

  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      req.flash("error", err);
      return;
    }

    if (!user) {
      User.create(req.body, function (err, user) {
        if (err) {
          req.flash("error", err);
          return;
        }
        return res.redirect("/users/signIn");
      });
    } else {
      req.flash("success", "You have signed up, login to continue!");
      return res.redirect("back");
    }
  });
};

module.exports.createSession = function (req, res) {
  //Find the user
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      console.log("Error in finding in signing in");
      return;
    }

    //Handle User found
    if (user) {
      //Handle password which doesn't match
      if (user.password != req.body.password) {
        return res.redirect("back");
      }

      //handle session creation
      res.cookie("user_id", user.id);
      req.flash("success", "Logged in Successfully");
      return res.redirect("/");
    } else {
      //handle user not found
      return res.redirect("back");
    }
  });
};

module.exports.signOut = function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have logged out");
    res.redirect("/users/signIn");
  });
};

module.exports.forgot = function (req, res) {
  return res.render('identity');
}

module.exports.resetPassword = function (req, res) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      console.log("Err in finding email", err);
      return;
    }
    if (user) {
      req.flash('success', "Change Password Now!");
      return res.render('changePassword', {
        user: user
      })
    } else {
      req.flash('error', "Email id do not exists");
      return res.redirect('back');
    }
  })
}

module.exports.getPassword = function (req, res) {
  return res.render('changePassword');
}

module.exports.changePassword = function (req, res) {
  if (req.body.newPassword == req.body.confirmNewPassword) {
    User.findOne({ email: req.params.id }, function (err, user) {
      if (user) {
        user.password = req.body.newPassword;
        user.save();
        req.flash('success', "Password Changes Successfully!");
        return res.redirect('/');
      } else {
        req.flash('error', "Didn't Find user");
      }
    })
  } else {
    req.flash("error", "Didn't match");
    return res.redirect('/identity');
  }
}

