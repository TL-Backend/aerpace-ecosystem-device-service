const async = require('async');

exports.eachLimitPromise = function eachLimitPromise(data, limit, operator) {
  return new Promise((resolve, reject) => {
    async.eachLimit(
      data,
      limit,
      (obj, callback) => {
        operator(obj)
          .then((result) => {
            callback(null);
          })
          .catch(callback);
      },
      (err) => {
        if (err) return reject(err);
        return resolve(err);
      },
    );
  });
};
