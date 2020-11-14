const express = require("express");
const router = express.Router();
var multer = require("multer");
const path = require("path");
let storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "uploadFiles/");
  },
  filename: function (req, file, callback) {
    let extension = path.extname(file.originalname);
    let basename = path.basename(file.originalname, extension);
    callback(null, basename + "-" + Date.now() + extension);
  },
});

let upload = multer({
  storage: storage,
});

const db = require("../lib/db");
const userMiddleware = require("../middleware/accounts");

router.get("/:year/:semester", userMiddleware.isLoggedIn, (req, res, next) => {
  const accountData = req.accountData;
  db.query(
    `SELECT * FROM \`courses\` WHERE \`year\` = ${db.escape(
      req.params.year
    )} AND \`semester\` = ${db.escape(req.params.semester)};`,
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
});

function saveCourse(body, res, fileId) {
  db.query(
    `INSERT INTO \`courses\` (\`year\`, \`semester\`, \`department\`, \`professorName\`, \`tutorName\`, \`tutorNumber\`, \`limit\`, \`fileId\`) VALUES (${db.escape(
      body.year
    )}, ${db.escape(body.semester)}, ${db.escape(body.department)}, ${db.escape(
      body.professorName
    )}, ${db.escape(body.tutorName)}, ${db.escape(
      body.tutorNumber
    )}, ${db.escape(body.limit)}, ${db.escape(fileId)});`,
    /*db.query(
    `INSERT INTO \`courses\` (\`year\`, \`semester\`, \`department\`, \`professorName\`, \`tutorName\`, \`tutorNumber\`, \`limit\`, \`fileId\`) VALUES (${db.escape(
      2020
    )}, ${db.escape(1)}, ${db.escape(0)}, ${db.escape("조겨리")}, ${db.escape(
      "윤정환"
    )}, ${db.escape(2018037010)}, ${db.escape(5)}, ${db.escape(fileId)});`,*/
    (err, result) => {
      if (err) {
        return res.status(400).send({
          success: false,
          msg: err,
        });
      }
      return res.status(201).send({
        success: true,
        msg: "튜터링 강의 등록 성공!",
      });
    }
  );
}

router.post(
  "/register",
  userMiddleware.isAdmin,
  upload.single("file"),
  (req, res, next) => {
    if (req.file) {
      db.query(
        `INSERT INTO \`files\` (\`originalFileName\`, \`serverFileName\`, \`type\`) VALUES (${db.escape(
          req.file.originalname
        )}, ${db.escape(req.file.filename)}, ${db.escape(0)}, ${db.escape(
          0
        )});`,
        (err, result) => {
          if (err) {
            return res.status(400).send({
              success: false,
              msg: err,
            });
          }
          saveCourse(req.body, res, result.insertId);
        }
      );
    } else {
      saveCourse(req.body, res, 0);
    }
  }
);

router.get("/delete/:id", userMiddleware.isAdmin, (req, res, next) => {
  console.log(req.params.id);
  db.query(
    `DELETE FROM \`courses\` WHERE \`id\` = ${db.escape(req.params.id)};`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          success: false,
          msg: err,
        });
      }
      return res.status(200).send({
        success: true,
        msg: "튜터링 강의 삭제 성공!",
      });
    }
  );
});

module.exports = router;
