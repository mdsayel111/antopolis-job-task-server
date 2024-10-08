/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint  no-unused-vars: "error" */
import { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import appErrorHandler from "../error-handler/app-error-handler";
import mongooseCastErrorHandler from "../error-handler/mongoose-cast-error-handler";
import mongooseDuplicateKeyErrorHandler from "../error-handler/mongoose-duplicate-key-error";
import mongooseValidationErrorHandler from "../error-handler/mongoose-validation-error-handler";
import zodErrorHandler from "../error-handler/zod-error-handler";
import AppError from "../errors/app-error";
import { TErrorObj } from "../types/error-handler";

// global error handle middleware
const globalErrorHandleMiddleware: ErrorRequestHandler = (
  err,
  req,
  res,
  next,
) => {
  // default status
  let status = 500;

  // default errObj
  let errObj: TErrorObj = {
    message: "Something went wrong !",
    error: [
      {
        path: "",
        message: "Something went wrong !",
      },
    ],
    stack: "",
  };

  // if error comes from zod validation
  if (err instanceof ZodError) {
    status = 400;

    // pass err to zodErrorHandler function
    errObj = zodErrorHandler(err);
  }

  // if error comes for mongoose validation
  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;

    // pass err to mongooseValidationErrorHandler
    errObj = mongooseValidationErrorHandler(err);
  }

  // if error comes from mongoose cast error
  if (err instanceof mongoose.Error.CastError) {
    status = 400;

    // pass err to mongooseCastErrorHandler
    errObj = mongooseCastErrorHandler(err);
  }

  // if error comes from mongoose duplicate key error
  if (err.code === 11000) {
    status = 400;

    // pass err to mongooseCastErrorHandler
    errObj = mongooseDuplicateKeyErrorHandler(err);
  }

  // if error comes from AppError
  if (err instanceof AppError) {
    status = err.statusValue;

    // pass err to appErrorHandler
    errObj = appErrorHandler(err);
  }

  // if newErrorObj is not null set errObj = newObj
  // if (newErrorObj) {
  //   errObj = newErrorObj;
  // }

  // if server run in production delete stack from errObj, so stack doesn't send with response
  if (process.env.NODE_ENV === "production") {
    delete errObj.stack;
  }

  // if status comes for authentication, then set statusCode to errObj
  // if (status === 401) {
  //   errObj.statusCode = 401;
  // }

  console.log(err);

  // send response if any error occur
  res.status(status).send({ success: false, status, ...errObj });
};

export default globalErrorHandleMiddleware;
