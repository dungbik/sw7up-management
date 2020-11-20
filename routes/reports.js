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
const { resolveCname } = require("dns");

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
            )}, ${db.escape(result.insertId)});`,
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

router.post(
  "/modify",
  userMiddleware.isLoggedIn,
  upload.single("file"),
  (req, res, next) => {
    const accountData = req.accountData;
    if (req.file) {
      db.query(
        `SELECT * FROM reports WHERE courseId = ${db.escape(
          req.params.courseId
        )} AND week = ${db.escape(req.params.week)};`,
        (err, result) => {
          if (err) {
            return res.status(400).json({
              success: false,
              msg: err,
            });
          }
          if (result[0].accountId != accountData.id) {
            return res.status(400).json({
              success: false,
              msg: "허용되지않은 접근입니다.",
            });
          }
          const reportId = result[0].id;
          const fileId = result[0].fileId;
          db.query(
            `SELECT * FROM files WHERE id = ${db.escape(fileId)};`,
            (err, result) => {
              if (err) {
                return res.status(400).json({
                  success: false,
                  msg: err,
                });
              }
              const filePath = uploadFolder + result[0].serverFileName;

              fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                  return res.status(400).json({
                    success: false,
                    msg: err,
                  });
                }

                fs.unlink(filePath, (err) => {
                  if (err) {
                    return res.status(400).json({
                      success: false,
                      msg: err,
                    });
                  }
                  db.query(
                    `DELETE FROM \`files\` WHERE \`id\` = ${db.escape(
                      fileId
                    )};`,
                    (err, result) => {
                      if (err) {
                        return res.status(400).send({
                          success: false,
                          msg: err,
                        });
                      }
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
                            `UPDATE reports SET fileId = ${db.escape(
                              result.insertId
                            )} WHERE id = ${reportId};`,
                            (err, result) => {
                              if (err) {
                                return res.status(400).send({
                                  success: false,
                                  msg: err,
                                });
                              }
                              return res.status(200).send({
                                success: true,
                                msg: "보고서 수정 성공!",
                              });
                            }
                          );
                        }
                      );
                    }
                  );
                });
              });
            }
          );
        }
      );
    } else {
      return res.status(400).json({
        success: false,
        msg: "보고서 파일이 없습니다.",
      });
    }
  }
);

function getReports(id, week) {
  return new Promise(function (resolve, reject) {
    let sql = `SELECT * FROM reports WHERE courseId = ${db.escape(id)}`;
    if (week > 0) {
      sql += ` AND week = ${week}`;
    }
    db.query(sql + ";", (err, result) => {
      if (err) {
        return res.status(400).send({
          success: false,
          msg: err,
        });
      }
      resolve(result);
    });
  });
}

function getResult(sql) {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
}

router.post("/find", userMiddleware.isAdmin, async (req, res, next) => {
  const week = req.body.week ? req.body.week : 0;
  await getResult(
    `SELECT * FROM \`courses\` WHERE \`year\` = ${db.escape(
      req.body.year
    )} AND \`semester\` = ${db.escape(req.body.semester)};`
  )
    .then(async (result) => {
      let courseData = result;
      for (let i = 0; i < courseData.length; i++)
        courseData[i].reports = await getReports(courseData[i].id, week);
      res.status(200).send({
        success: true,
        courseData,
      });
    })
    .catch((err) => {
      res.status(400).send({
        success: false,
        msg: err,
      });
    });

  /*
  db.query(
    `SELECT * FROM \`courses\` WHERE \`year\` = ${db.escape(
      req.body.year
    )} AND \`semester\` = ${db.escape(req.body.semester)};`,
    async (err, result) => {
      if (err) {
        return res.status(400).send({
          success: false,
          msg: err,
        });
      }
      let courseData = result;
      for (let i = 0; i < courseData.length; i++)
        courseData[i].reports = await getReports(courseData[i].id, week);

      return res.status(200).send({
        success: true,
        courseData,
      });
    }
  );*/
});

module.exports = router;
