const ServerErrorMiddleWare = (req, res, next) => {
    const err = new Error("Not Found on server");
    err.statuscode = 404;
    next(err);
  };
  
  const ErrorHandlerMiddleWare = (error, req, res, next) => {
    error.statuscode = error.statuscode || 500;
    error.status = error.status;
    res.status(error.statuscode).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  };
  
  export { ErrorHandlerMiddleWare, ServerErrorMiddleWare };
  