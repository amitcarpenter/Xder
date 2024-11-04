
const handleError = (res, statusCode, message) => {
    return res.status(statusCode).send({
      success: false,
      status: statusCode,
      message: message
    });
  };
  
  const handleSuccess = (res, statusCode, message, ...data) => {
    return res.status(statusCode).json({
      success: true,
      status: statusCode,
      message: message,
      data: data.length > 0 ? data[0] : undefined,
    });
  };
  
  const joiErrorHandle = (res, error) => {
    return res.status(400).send({
      success: false,
      status: 400,
      message: error.details[0].message
    });
  };
  
  module.exports = {
    handleError,
    handleSuccess,
    joiErrorHandle
  };
  