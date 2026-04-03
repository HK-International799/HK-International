import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";

/**
 * validate — factory that returns middleware checking req.body against a schema object.
 * Schema: { fieldName: { required?: bool, type?: string, enum?: [], min?: num, max?: num, match?: RegExp } }
 */
export const validate = (schema) => (req, _res, next) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.body[field];

    if (rules.required && (value === undefined || value === null || value === "")) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value === undefined || value === null) continue;

    if (rules.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push(`${field} must be a valid email`);
    }

    if (rules.type === "string" && typeof value !== "string") {
      errors.push(`${field} must be a string`);
    }

    if (rules.type === "number" && (typeof value !== "number" || isNaN(value))) {
      errors.push(`${field} must be a number`);
    }

    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(", ")}`);
    }

    if (rules.min !== undefined && typeof value === "number" && value < rules.min) {
      errors.push(`${field} must be at least ${rules.min}`);
    }

    if (rules.max !== undefined && typeof value === "number" && value > rules.max) {
      errors.push(`${field} must be at most ${rules.max}`);
    }

    if (rules.minLength && typeof value === "string" && value.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`);
    }

    if (rules.match && !rules.match.test(value)) {
      errors.push(`${field} format is invalid`);
    }
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join("; ")));
  }

  next();
};

/**
 * validateObjectId — validates that req.params[paramName] is a valid MongoDB ObjectId.
 */
export const validateObjectId = (...paramNames) => (req, _res, next) => {
  for (const p of paramNames) {
    if (req.params[p] && !mongoose.Types.ObjectId.isValid(req.params[p])) {
      return next(new ApiError(400, `Invalid ID: ${req.params[p]}`));
    }
  }
  next();
};
