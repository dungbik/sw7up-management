const express = require("express");
const router = express.Router();

const db = require("../lib/db");
const userMiddleware = require("../middleware/accounts");

router.post("/upload", userMiddleware.isLoggedIn, (req, res, next) => {
  // 튜터인지 확인
});

router.get("/", userMiddleware.isAdmin, (req, res, next) => {});

module.exports = router;
