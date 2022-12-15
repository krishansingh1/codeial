const express = require("express");

const router = express.Router();

const homeController = require("../controller/home_controller");

console.log("Router is loaded");

router.get("/", homeController.home);
router.use("/users", require("./users"));
router.use("/posts", require("./posts"));
router.use("/comments", require("./comments"));
router.use('/identity', require('./identity'));

module.exports = router;
