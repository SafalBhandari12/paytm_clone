import express, { application } from "express";
import z, { promise, string } from "zod";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/authMiddleware.js";

const JWT_SECRET = process.env.JWT_SECRET;

const signUpSchema = z.object({
  firstName: z.string().min(3).max(50),
  lastName: z.string().min(3).max(50),
  userName: z.string().min(3).max(50),
  password: z
    .string()
    .min(3)
    .regex(/[A-Z]/, "At least one uppercase")
    .regex(/[a-z]/, "At least one lowercase")
    .regex(/[^[a-zA-Z0-9]/),
});

const patchUpdateSchema = z.object({
  firstName: z.string().min(3).max(50).optional(),
  lastName: z.string().min(3).max(50).optional(),
  userName: z.string().min(3).max(50).optional(),
  password: z
    .string()
    .min(3)
    .regex(/[A-Z]/, "At least one uppercase")
    .regex(/[a-z]/, "At least one lowercase")
    .regex(/[^[a-zA-Z0-9]/)
    .optional(),
});

const loginschema = z.object({
  userName: z.string(),
  password: string(),
});

const batchSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
});

const router = express.Router();

router.post("/signUp", async (req, res) => {
  try {
    const result = signUpSchema.safeParse(req.body);
    if (!result.success) {
      return res.json(result.error);
    }

    const { firstName, lastName, userName, password } = result.data;

    const userExist = await prisma.user.findUnique({
      where: {
        userName: userName,
      },
    });
    console.log(userExist);

    if (userExist) {
      return res
        .status(411)
        .json({ msg: "User with this username already exists" });
    }

    const nn = await prisma.user.create({
      data: {
        firstName,
        lastName,
        userName,
        password,
        Balance: {
          create: {
            balance: 10000,
          },
        },
      },
    });

    const jwtToken = jwt.sign({ userId: nn.id }, process.env.JWT_SECRET, {
      expiresIn: "60h",
    });

    return res
      .status(200)
      .json({ token: jwtToken, msg: "User created successfully" });
  } catch (error) {
    console.log(error);
  }
});

// TODO: Add password encryption before storing it in the database
router.post("/login", async (req, res) => {
  try {
    const resValidation = loginschema.safeParse(req.body);
    if (!resValidation.success) {
      return res.status(400).json(resValidation.data);
    }

    const { userName, password } = resValidation.data;
    const user = await prisma.user.findUnique({
      where: {
        userName: userName,
      },
    });

    if (user === null || user.password !== password) {
      return res.status(401).json({ msg: "Username or password is wrong" });
    }

    const token = jwt.sign(
      {
        userName: userName,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.status(200).json({ msg: "Welcome to the website", token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server errror" });
  }
});

router.patch("/update", authMiddleware, async (req, res) => {
  const { success, data, error } = patchUpdateSchema.safeParse(req.body);
  console.log("Reached");

  if (!success) {
    return res.status(400).json(error);
  }

  const { firstName, lastName, password } = data;

  console.log(req.user);
  console.log(typeof req.user);
  console.log(req.user.userName);

  const queryResult = await prisma.user.update({
    where: {
      userName: req.user.userName,
    },
    data: {
      firstName,
      lastName,
      password,
    },
  });

  console.log(queryResult);

  return res.status(200).json({ msg: "Welcome to my website" });
});

router.get("/batch", authMiddleware, async (req, res) => {
  const { success, error, data } = batchSchema.safeParse(req.query);
  if (!success) {
    return res.status(400).json(error);
  }
  const usersData = await prisma.user.findMany({
    where: {
      firstName: {
        contains: data.firstName,
        mode: "insensitive",
      },
      lastName: {
        contains: data.lastName,
        mode: "insensitive",
      },
    },
    select: {
      firstName: true,
      lastName: true,
      id: true,
    },
  });
  return res.status(200).json(usersData);
});

export default router;
