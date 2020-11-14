const jwt = require("jsonwebtoken");
const db = require("../lib/db");

module.exports = {
  isLoggedIn: (req, res, next) => {
    try {
      const token = req.cookies.w_auth;
      const decoded = jwt.verify(token, "BESTSW7UP");
      db.query(
        `SELECT * FROM accounts WHERE token = ${db.escape(token)};`,
        (err, result) => {
          if (err) {
            return res.status(400).json({
              success: false,
              msg: err,
            });
          }
          if (!result.length) {
            return res.status(200).json({
              success: false,
              msg: "토큰이 유효하지 않습니다.",
            });
          }
          req.accountData = decoded;
          next();
        }
      );
    } catch (err) {
      return res.status(200).send({
        success: false,
        msg: "인증 실패!",
      });
    }
  },
  isAdmin: (req, res, next) => {
    try {
      const token = req.cookies.w_auth;
      const decoded = jwt.verify(token, "BESTSW7UP");
      db.query(
        `SELECT * FROM accounts WHERE token = ${db.escape(token)};`,
        (err, result) => {
          if (err) {
            return res.status(200).json({
              success: false,
              msg: err,
            });
          }
          if (!result.length) {
            return res.status(200).json({
              success: false,
              msg: "토큰이 유효하지 않습니다.",
            });
          }
          if (decoded.isAdmin) {
            req.accountData = decoded;
            next();
          } else {
            return res.status(200).send({
              success: false,
              msg: "관리자 인증 실패!",
            });
          }
        }
      );
    } catch (err) {
      return res.status(200).send({
        success: false,
        msg: "관리자 인증 실패!",
      });
    }
  },
};
