"use server";
import prisma from "@/lib/prisma";
import { UpdateUserCurrencySchema } from "@/schema/userSetting";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function UpdateUserCurrency(currency: string) {
  // Validate the currency using Zod schema
  const parsedBody = UpdateUserCurrencySchema.safeParse({ currency });

  if (!parsedBody.success) {
    throw parsedBody.error;
  }

  const user = await currentUser(); // Get current user
  if (!user) {
    redirect("sign-in");
  }

  // Update the user's currency in the database
  const userSetting = await prisma.userSetting.update({
    where: { userId: user.id },
    data: { currency },
  });

  return userSetting;
}
