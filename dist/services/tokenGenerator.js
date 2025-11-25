"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jwt = require("jsonwebtoken");
const tokenGenerator = (email, userId) => {
    const secretKey = process.env.JWT_SECRET;
    const payload = userId ? { email, userId } : { email };
    const token = jwt.sign(payload, secretKey);
    return token;
};
exports.default = tokenGenerator;
