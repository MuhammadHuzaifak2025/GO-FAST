const asynchandler = (reuqesthandler) => {
  return (req, res, next) => {
    Promise.resolve(reuqesthandler(req, res, next)).catch((error) => {
      next(error);
    });
  };
};
export default asynchandler;
