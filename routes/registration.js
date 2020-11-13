const express = require("express");
const router = express.Router();

const db = require("../lib/db");
const userMiddleware = require("../middleware/accounts");

router.get("/", userMiddleware.isLoggedIn, (req, res, next) => {
  const accountData = req.accountData;
  db.query(
    `SELECT * FROM \`registrations\` WHERE \`accountId\` = ${db.escape(
      accountData.id
    )};`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          success: false,
          msg: err,
        });
      }

      ids = result.map((n) => n.id);

      db.query(
        `SELECT * FROM \`subjects\` WHERE \`id\` IN (${db.escape(ids)});`,
        (err, result) => {
          if (err) {
            return res.status(400).send({
              success: false,
              msg: err,
            });
          }

          return res.status(200).send({
            success: true,
            result,
          });
        }
      );
    }
  );
});

router.get("/delete/:id", userMiddleware.isLoggedIn, (req, res, next) => {
  const accountData = req.accountData;
  db.query(
    `DELETE FROM \`registrations\` WHERE \`accountId\` = ${db.escape(
      accountData.id
    )} AND \`courseId\` = ${db.escape(req.params.id)};`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          success: false,
          msg: err,
        });
      }
      return res.status(200).send({
        success: true,
        msg: "튜터링 강의 신청 취소 완료!",
      });
    }
  );
});

router.post("/register", userMiddleware.isLoggedIn, (req, res, next) => {
  const accountData = req.accountData;
  db.query(
    `INSERT INTO \`registrations\` (\`accountId\`, \`courseId\`) VALUES (${db.escape(
      accountData.id
    )}, ${db.escape(req.body.courseId)});`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          success: false,
          msg: err,
        });
      }
      return res.status(201).send({
        success: true,
        msg: "튜터링 강의 신청 성공!",
      });
    }
  );
});

module.exports = router;
