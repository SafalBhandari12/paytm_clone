import express from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({ msg: "User is not authenticated" });
  }
  console.log("Wtf is happening");
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403);
    req.user = user;

    next();
  });
};
