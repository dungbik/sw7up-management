const express = require("express");
const router = express.Router();

const db = require("../lib/db");
const userMiddleware = require("../middleware/accounts");

module.exports = router;
