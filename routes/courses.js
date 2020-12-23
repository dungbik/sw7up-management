const { resolveSoa } = require("dns");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");

const { getResult, getDownloadFilename } = require("../lib/util");

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

function getCount(id) {
  return new Promise(function (resolve, reject) {
    db.query(
      `SELECT COUNT(*) as cnt FROM registrations WHERE courseId = ${db.escape(
        id
      )};`,
      (err, result) => {
        if (err) {
          return res.status(200).send({
            success: false,
            msg: err,
          });
        }
        resolve(result[0].cnt);
      }
    );
  });
}

router.get(
  "/find/:year/:semester",
  userMiddleware.isLoggedIn,
  (req, res, next) => {
    const accountData = req.accountData;
    db.query(
      `SELECT * FROM \`courses\` WHERE \`year\` = ${db.escape(
        req.params.year
      )} AND \`semester\` = ${db.escape(req.params.semester)};`,
      async (err, result) => {
        if (err) {
          return res.status(200).send({
            success: false,
            msg: err,
          });
        }
        let courseData = result;
        for (let i = 0; i < courseData.length; i++)
          courseData[i].appliedCount = await getCount(courseData[i].id);

        return res.status(200).send({
          success: true,
          courseData,
        });
      }
    );
  }
);

function saveCourse(body, res, fileId) {
  db.query(
    `INSERT INTO \`courses\` (\`year\`, \`semester\`, \`department\`, \`grade\`, \`courseName\`, \`professorName\`, \`tutorName\`, \`tutorNumber\`, \`limit\`, \`fileId\`) VALUES (${db.escape(
      body.year
    )}, ${db.escape(body.semester)}, ${db.escape(body.department)}, ${db.escape(
      body.grade
    )}, ${db.escape(body.courseName)}, ${db.escape(
      body.professorName
    )}, ${db.escape(body.tutorName)}, ${db.escape(
      body.tutorNumber
    )}, ${db.escape(body.limit)}, ${db.escape(fileId)});`,
    (err, result) => {
      if (err) {
        return res.status(200).send({
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
        )}, ${db.escape(req.file.filename)}, ${db.escape(0)});`,
        (err, result) => {
          if (err) {
            return res.status(200).send({
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

function updateCourse(jsonRes, res, fileId) {
  console.log("uc");
  console.log(jsonRes);
  db.query(
    `UPDATE \`courses\` SET \`year\` = ${db.escape(
      jsonRes.year
    )}, \`semester\` = ${db.escape(jsonRes.semester)}, 
    \`department\` = ${db.escape(jsonRes.department)}, \`grade\` = ${db.escape(
      jsonRes.grade
    )}, 
    \`courseName\` = ${db.escape(
      jsonRes.courseName
    )}, \`professorName\` = ${db.escape(jsonRes.professorName)}, 
    \`tutorName\` = ${db.escape(
      jsonRes.tutorName
    )}, \`tutorNumber\` = ${db.escape(jsonRes.tutorNumber)}, 
    \`limit\` = ${db.escape(jsonRes.limit)}, \`fileId\` = ${db.escape(
      fileId
    )} WHERE \`id\` = ${db.escape(jsonRes.courseId)};`,
    (err, result) => {
      console.log(err, result);
      if (err) {
        return res.status(200).send({
          success: false,
          msg: err,
        });
      }
      return res.status(201).send({
        success: true,
        msg: "튜터링 강의 수정 성공!",
      });
    }
  );
}

router.post(
  "/modify",
  userMiddleware.isLoggedIn,
  upload.single("file"),
  async (req, res, next) => {
    console.log(req.body);
    return await getResult(
      db,
      `SELECT * FROM \`courses\` WHERE id = ${req.body.courseId};`
    )
      .then((result) => {
        console.log(result);
        const fileId = result[0].fileId;
        console.log(fileId);
        if (req.file) {
          db.query(
            `INSERT INTO \`files\` (\`originalFileName\`, \`serverFileName\`, \`type\`) VALUES (${db.escape(
              req.file.originalname
            )}, ${db.escape(req.file.filename)}, ${db.escape(0)});`,
            (err, result) => {
              console.log(err, result);
              if (err) {
                return res.status(200).send({
                  success: false,
                  msg: err,
                });
              }

              updateCourse(req.body, res, result.insertId);
            }
          );
        } else {
          updateCourse(req.body, res, fileId);
        }
      })
      .catch((err) => {
        return res.status(200).send({
          success: false,
          msg: err,
        });
      });
  }
);

router.get("/delete/:id", userMiddleware.isAdmin, (req, res, next) => {
  console.log(req.params.id);
  db.query(
    `DELETE FROM \`courses\` WHERE \`id\` = ${db.escape(req.params.id)};`,
    (err, result) => {
      if (err) {
        return res.status(200).send({
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

router.get("/download/:fileId", userMiddleware.isLoggedIn, (req, res, next) => {
  db.query(
    `SELECT * FROM \`files\` WHERE id = ${db.escape(req.params.fileId)};`,
    (err, result) => {
      if (err) {
        return res.status(200).send({
          success: false,
          msg: err,
        });
      }
      const file = uploadFolder + result[0].serverFileName;

      try {
        if (fs.existsSync(file)) {
          const mimeType = mime.lookup(file);

          res.setHeader(
            "Content-disposition",
            "attachment; filename=" +
              getDownloadFilename(req, result[0].originalFileName)
          );
          res.setHeader("Content-type", mimeType);
          res.setHeader(
            "File-Name",
            getDownloadFilename(req, result[0].originalFileName)
          );

          var filestream = fs.createReadStream(file);
          filestream.pipe(res);
        } else {
          return res.status(200).send({
            success: false,
            msg: "서버에 파일이 존재하지 않습니다.",
          });
        }
      } catch (e) {
        if (err) {
          return res.status(200).send({
            success: false,
            msg: e,
          });
        }
      }
    }
  );
});

module.exports = router;
