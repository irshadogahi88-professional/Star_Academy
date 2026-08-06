const { sanitize } = require('express-mongo-sanitize');

const mongoSanitizeSafe = () => {
  return (req, res, next) => {
    if (req.body) {
      for (let key in req.body) {
        req.body[key] = sanitize(req.body[key]);
      }
    }
    if (req.query) {
      for (let key in req.query) {
        req.query[key] = sanitize(req.query[key]);
      }
    }
    if (req.params) {
      for (let key in req.params) {
        req.params[key] = sanitize(req.params[key]);
      }
    }
    next();
  };
};

module.exports = mongoSanitizeSafe;
