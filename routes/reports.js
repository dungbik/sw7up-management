const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");

const uploadFolder = "uploadFiles/";

let storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, uploadFolder);
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

router.post(
  "/upload",
  userMiddleware.isLoggedIn,
  upload.single("file"),
  (req, res, next) => {
    // Todo 튜터인지 확인
    const accountData = req.accountData;
    if (req.file) {
      db.query(
        `INSERT INTO \`files\` (\`originalFileName\`, \`serverFileName\`, \`type\`) VALUES (${db.escape(
          req.file.originalname
        )}, ${db.escape(req.file.filename)}, ${db.escape(1)});`,
        (err, result) => {
          if (err) {
            return res.status(400).send({
              success: false,
              msg: err,
            });
          }
          db.query(
            `INSERT INTO \`reports\` (\`accountId\`,\`courseId\`, \`week\`, \`fileId\`) VALUES (${db.escape(
              accountData.id
            )}, ${db.escape(req.params.courseId)}, ${db.escape(
              req.params.week
            )}, ${db.escape(1)});`,
            (err, result) => {
              if (err) {
                return res.status(400).send({
                  success: false,
                  msg: err,
                });
              }
              return res.status(201).send({
                success: true,
                msg: "보고서 등록 성공!",
              });
            }
          );
        }
      );
    } else {
      return res.status(400).send({
        success: false,
        msg: "보고서 파일이 없습니다.",
      });
    }
  }
);

router.post("/modify", userMiddleware.isLoggedIn, (req, res, next) => {});

router.get("/:id", userMiddleware.isAdmin, (req, res, next) => {});

module.exports = router;
