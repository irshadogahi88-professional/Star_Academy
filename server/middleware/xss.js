const xss = require('xss');

/**
 * Clean data from XSS
 * @param {Object} data 
 * @returns {Object} cleaned data
 */
const cleanObj = (data) => {
  if (!data) return data;
  
  if (typeof data === 'string') {
    return xss(data);
  }
  
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      data[i] = cleanObj(data[i]);
    }
  }
  
  if (typeof data === 'object' && data !== null) {
    for (let key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        data[key] = cleanObj(data[key]);
      }
    }
  }
  
  return data;
};

const xssClean = () => {
  return (req, res, next) => {
    if (req.body) {
      for (let key in req.body) {
        req.body[key] = cleanObj(req.body[key]);
      }
    }
    if (req.query) {
      for (let key in req.query) {
        req.query[key] = cleanObj(req.query[key]);
      }
    }
    if (req.params) {
      for (let key in req.params) {
        req.params[key] = cleanObj(req.params[key]);
      }
    }
    next();
  };
};

module.exports = xssClean;
