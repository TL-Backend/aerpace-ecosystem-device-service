const info = (data) => {
  console.log(data);
};

const error = (data) => {
  console.error(data);
};

exports.logger = {
  info,
  error,
};
