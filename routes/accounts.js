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
        return res.status(400).json({
          success: false,
          msg: err,
        });
      }
      if (result.length) {
        return res.status(409).json({
          success: false,
          msg: "이미 가입된 학번입니다!",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              success: false,
              msg: err,
            });
          } else {
            db.query(
              `INSERT INTO \`accounts\` (\`_id\`, \`password\`, \`name\`, \`email\`, \`phoneNumber\`, \`department\`, \`role\`, \`token\`) VALUES (${db.escape(
                req.body._id
              )}, ${db.escape(hash)}, ${db.escape(req.body.name)}, ${db.escape(
                req.body.email
              )}, ${db.escape(req.body.phoneNumber)}, ${db.escape(
                req.body.department
              )}, ${db.escape(req.body.role)}, ${db.escape("")});`,
              (err, result) => {
                if (err) {
                  return res.status(400).json({
                    success: false,
                    msg: err,
                  });
                }
                return res.status(201).json({
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
        return res.status(400).json({
          success: false,
          msg: err,
        });
      }
      if (!result.length) {
        return res.status(400).json({
          success: false,
          msg: "존재하지 않는 학번입니다.",
        });
      }
      const accountData = result[0];
      bcrypt.compare(
        req.body.password,
        accountData["password"],
        (bErr, bResult) => {
          if (bErr) {
            return res.status(400).json({
              success: false,
              msg: "비밀번호를 비교하다가 에러가 발생했습니다.",
            });
          }
          if (bResult) {
            const token = jwt.sign(
              {
                id: accountData.id,
                _id: accountData._id,
                name: accountData.name,
                email: accountData.email,
                phoneNumber: accountData.phoneNumber,
                department: accountData.department,
                role: accountData.role,
                isAdmin: accountData.role === 3 ? true : false,
              },
              "BESTSW7UP",
              {
                expiresIn: "1h",
              }
            );
            db.query(
              `UPDATE accounts SET token = ${db.escape(
                token
              )} WHERE _id = ${db.escape(accountData._id)};`,
              (err, result) => {
                if (err) {
                  return res.status(400).json({
                    success: false,
                    msg: err,
                  });
                }
                return res.cookie("w_auth", token).status(200).json({
                  success: true,
                  msg: "로그인 성공!",
                  account: accountData,
                });
              }
            );
          } else {
            return res.status(400).json({
              success: false,
              msg: "비밀번호가 맞지 않습니다.",
            });
          }
        }
      );
    }
  );
});

router.get("/logout", userMiddleware.isLoggedIn, (req, res, next) => {
  res.clearCookie("w_auth").send(req.cookies.name);
  db.query(
    `UPDATE accounts SET token = ${db.escape("")} WHERE _id = ${db.escape(
      req.accountData._id
    )};`,
    (err, result) => {
      if (err) {
        return res.status(400).json({
          success: false,
          msg: err,
        });
      }
      return res.status(200).json({
        success: true,
        msg: "로그아웃 성공!",
      });
    }
  );
});

router.get("/auth", userMiddleware.isLoggedIn, (req, res, next) => {
  const account = req.accountData;

  return res.status(200).json({
    success: true,
    msg: "인증 성공!",
    account,
  });
});

router.post("/modify", userMiddleware.isLoggedIn, (req, res, next) => {
  const accountData = req.accountData;
  if (!(req.body.role >= 0 && req.body.role < 3)) {
    return res.status(400).json({
      success: false,
      msg: "잘못된 요청입니다.",
    });
  }
  db.query(
    `SELECT * FROM accounts WHERE _id = ${db.escape(accountData._id)};`,
    (err, result) => {
      if (err) {
        return res.status(400).json({
          success: false,
          msg: err,
        });
      }
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            success: false,
            msg: err,
          });
        } else {
          db.query(
            `UPDATE accounts SET password = ${db.escape(
              hash
            )}, name = ${db.escape(req.body.name)}, email = ${db.escape(
              req.body.email
            )}, phoneNumber = ${db.escape(
              req.body.phoneNumber
            )}, department = ${db.escape(
              req.body.department
            )}, role = ${db.escape(req.body.role)} WHERE _id = ${db.escape(
              accountData._id
            )};`,
            (err, result) => {
              if (err) {
                return res.status(400).json({
                  success: false,
                  msg: err,
                });
              }
              return res.status(200).json({
                success: true,
                msg: "회원정보 수정 성공!",
              });
            }
          );
        }
      });
    }
  );
});

module.exports = router;
