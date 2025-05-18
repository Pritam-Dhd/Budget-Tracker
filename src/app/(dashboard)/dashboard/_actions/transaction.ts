"use server";

import prisma from "@/lib/prisma";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "@/schema/transaction";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function createTransaction(form: CreateTransactionSchemaType) {
  const parsedBody = CreateTransactionSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-up");
  }

  const { amount, category, date, description, type, currency } =
    parsedBody.data;

  const categoryRow = await prisma.category.findFirst({
    where: {
      userId: user.id,
      name: category,
    },
  });

  if (!categoryRow) {
    throw new Error("Category not found");
  }

  // Create transaction record
  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        date,
        description: description || "",
        type,
        currency,
        category: categoryRow.name,
        categoryIcon: categoryRow.icon,
      },
    }),

    // Update month table
    prisma.monthHistory.upsert({
      where: {
        day_month_year_userId_currency: {
          userId: user.id,
          day: date.getUTCDate(),
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
          currency: currency,
        },
      },
      create: {
        userId: user.id,
        day: date.getUTCDate(),
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        currency: currency,
        expense: type === "expense" ? amount : 0,
        income: type === "income" ? amount : 0,
      },
      update: {
        expense: {
          increment: type === "expense" ? amount : 0,
        },
        income: {
          increment: type === "income" ? amount : 0,
        },
      },
    }),

    // Update year table
    prisma.yearHistory.upsert({
      where: {
        month_year_userId_currency: {
          userId: user.id,
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
          currency: currency,
        },
      },
      create: {
        userId: user.id,
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        currency: currency,
        expense: type === "expense" ? amount : 0,
        income: type === "income" ? amount : 0,
      },
      update: {
        expense: {
          increment: type === "expense" ? amount : 0,
        },
        income: {
          increment: type === "income" ? amount : 0,
        },
      },
    }),
  ]);
}
