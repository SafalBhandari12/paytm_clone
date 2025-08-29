import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import prisma from "../lib/prisma.js";
import z from "zod";

const router = express.Router();

const transferSchema = z.object({
  to: z.string(),
  amount: z.number(),
});

router.get("/balance", authMiddleware, async (req, res) => {
  console.log(req.user);
  const userBalance = await prisma.user.findUnique({
    where: {
      userName: req.user.userName,
    },
    select: {
      Balance: {
        select: {
          balance: true,
        },
      },
    },
  });

  return res.status(200).json({ balance: userBalance.Balance.balance });
});

router.post("/transfer", authMiddleware, async (req, res) => {
  const { success, error, data } = transferSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json(error);
  }
  const { amount, to } = data;
  const userAmount = await prisma.user.findUnique({
    where: {
      userName: req.user.userName,
    },
    select: {
      Balance: {
        select: {
          balance: true,
        },
      },
    },
  });
  if (userAmount.Balance.balance <= amount) {
    return res.status(400).json({ msg: "Insufficient balance" });
  }

  const toUser = await prisma.user.findUnique({
    where: {
      userName: to,
    },
  });

  if (!toUser || toUser.userName === req.user.userName) {
    return res.status(400).json({ msg: "Invalid Account" });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        userName: req.user.userName,
      },
      data: {
        Balance: {
          update: {
            balance: {
              decrement: amount,
            },
          },
        },
      },
    }),
    prisma.user.update({
      where: {
        userName: to,
      },
      data: {
        Balance: {
          update: {
            balance: {
              increment: amount,
            },
          },
        },
      },
    }),
  ]);

  return res
    .status(200)
    .json({ msg: "money deducted from the account successfully" });
});

export default router;
