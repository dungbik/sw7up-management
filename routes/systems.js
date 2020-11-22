const express = require("express");
const router = express.Router();

const db = require("../lib/db");
const userMiddleware = require("../middleware/accounts");

router.get("/", userMiddleware.isAdmin, (req, res, next) => {
  db.query(`SELECT * FROM systems;`, (err, result) => {
    if (err) {
      return res.status(400).json({
        success: false,
        msg: err,
      });
    }
    return res.status(200).json({
      success: false,
      systems: result,
    });
  });
});

router.get(
  "/find/:systemId/:year/:semester",
  userMiddleware.isAdmin,
  (req, res, next) => {
    const accountData = req.accountData;
    db.query(
      `SELECT * FROM periods WHERE systemId = ${req.params.systemId} AND year = ${req.params.year} AND semester = ${req.params.semester};`,
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
            msg: err,
          });
        }

        return res.status(200).send({
          success: true,
          result: result[0],
        });
      }
    );
  }
);

router.post("/modify", userMiddleware.isAdmin, (req, res, next) => {
  const accountData = req.accountData;
  db.query(
    `SELECT * FROM periods WHERE systemId = ${req.body.systemId} AND year = ${req.body.year} AND semester = ${req.body.semester};`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          success: false,
          msg: err,
        });
      }
      if (!result.length) {
        db.query(
          `INSERT INTO \`periods\` (\`systemId\`, \`year\`, \`semester\`, \`start\`, \`end\`) VALUES (${db.escape(
            req.body.systemId
          )}, ${db.escape(req.body.year)}, ${db.escape(
            req.body.semester
          )}, ${db.escape(req.body.start)}, ${db.escape(req.body.end)});`,
          (err, result) => {
            if (err) {
              return res.status(400).send({
                success: false,
                msg: err,
              });
            }
            return res.status(201).send({
              success: true,
              msg: "기간 추가 성공!",
            });
          }
        );
      } else {
        const periodId = result[0].id;
        db.query(
          `UPDATE periods SET start = ${db.escape(
            req.body.start
          )}, end = ${db.escape(req.body.end)} WHERE id = ${periodId};`,
          (err, result) => {
            if (err) {
              return res.status(400).send({
                success: false,
                msg: err,
              });
            }
            return res.status(200).send({
              success: true,
              msg: "기간 변경 성공!",
            });
          }
        );
      }
    }
  );
});

module.exports = router;
