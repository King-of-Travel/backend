const express = require("express");
const router = express.Router();

router.put("/", function(req, res) {
  res.send("Hi");
});

module.exports = router;
