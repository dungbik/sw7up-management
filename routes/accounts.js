const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../lib/db");
const userMiddleware = require("../middleware/accounts");

router.post("/register", (req, res, next) => {
  db.query(
    `SELECT * FROM accounts WHERE _id = LOWER(${db.escape(req.body._id)});`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          success: false,
          msg: err,
        });
      }
      if (result.length) {
        return res.status(409).send({
          success: false,
          msg: "이미 가입된 학번입니다!",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              success: false,
              msg: err,
            });
          } else {
            db.query(
              `INSERT INTO \`accounts\` (\`_id\`, \`password\`, \`name\`, \`email\`, \`phoneNumber\`, \`department\`, \`role\`) VALUES (${db.escape(
                req.body._id
              )}, ${db.escape(hash)}, ${db.escape(req.body.name)}, ${db.escape(
                req.body.email
              )}, ${db.escape(req.body.phoneNumber)}, ${db.escape(
                req.body.department
              )}, ${db.escape(req.body.role)});`,
              (err, result) => {
                if (err) {
                  return res.status(400).send({
                    success: false,
                    msg: err,
                  });
                }
                return res.status(201).send({
                  success: true,
                  msg: "회원가입 성공!",
                });
              }
            );
          }
        });
      }
    }
  );
});

router.post("/login", (req, res, next) => {
  db.query(
    `SELECT * FROM accounts WHERE _id = ${db.escape(req.body._id)};`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          success: false,
          msg: err,
        });
      }
      if (!result.length) {
        return res.status(400).send({
          success: false,
          msg: "존재하지 않는 학번입니다.",
        });
      }
      bcrypt.compare(
        req.body.password,
        result[0]["password"],
        (bErr, bResult) => {
          if (bErr) {
            return res.status(400).send({
              success: false,
              msg: "비밀번호를 비교하다가 에러가 발생했습니다.",
            });
          }
          if (bResult) {
            const token = jwt.sign(
              {
                id: result[0].id,
                number: result[0]._id,
                name: result[0].name,
                email: result[0].email,
                phoneNumber: result[0].phoneNumber,
                department: result[0].department,
                role: result[0].role,
                isAdmin: result[0].role === 3 ? true : false,
              },
              "BESTSW7UP",
              {
                expiresIn: "1h",
              }
            );
            return res.cookie("w_auth", token).status(200).json({
              success: true,
              msg: "로그인 성공!",
              account: result[0],
            });
          }
          return res.status(400).send({
            success: false,
            msg: "비밀번호가 맞지 않습니다.",
          });
        }
      );
    }
  );
});

router.get("/auth", userMiddleware.isLoggedIn, (req, res, next) => {
  const account = req.accountData;

  return res.status(200).send({
    success: true,
    msg: "인증 성공!",
    account,
  });
});

module.exports = router;
