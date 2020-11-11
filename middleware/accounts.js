const jwt = require("jsonwebtoken");

module.exports = {
  isLoggedIn: (req, res, next) => {
    try {
      const token = req.cookies.w_auth;
      const decoded = jwt.verify(token, "BESTSW7UP");
      req.accountData = decoded;
      next();
    } catch (err) {
      return res.status(401).send({
        success: false,
        msg: "인증 실패!",
      });
    }
  },
  isAdmin: (req, res, next) => {
    try {
      const token = req.cookies.w_auth;
      const decoded = jwt.verify(token, "BESTSW7UP");
      if (decoded.isAdmin) {
        req.accountData = decoded;
        next();
      } else {
        return res.status(401).send({
          success: false,
          msg: "관리자 인증 실패!",
        });
      }
    } catch (err) {
      return res.status(401).send({
        success: false,
        msg: "관리자 인증 실패!",
      });
    }
  },
};
