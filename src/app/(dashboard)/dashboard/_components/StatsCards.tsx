"use client";
import { GetBalanceResponseType } from "@/app/api/stats/balance/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card } from "@/components/ui/card";
import { UserSetting } from "@/generated/prisma";
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helper";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import React, { ReactNode, useCallback } from "react";
import CountUp from "react-countup";

interface Props {
  from: Date;
  to: Date;
  userSetting: UserSetting;
}

const StatsCards = ({ userSetting, from, to }: Props) => {
  const { data, isFetching } = useQuery<GetBalanceResponseType>({
    queryKey: ["overview", "status", from, to],
    queryFn: () =>
      fetch(
        `/api/stats/balance?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`
      )
        .then((res) => res.json())
        .catch((err) => {
          console.error("Failed to fetch stats:", err);
          return { income: [], expense: [] };
        }),
  });

  const incomeData = data?.income || [];
  const expenseData = data?.expense || [];

  const allCurrencies = Array.from(
    new Set([
      ...incomeData.map((i) => i.currency),
      ...expenseData.map((e) => e.currency),
    ])
  );

  const isEmpty = incomeData.length === 0 && expenseData.length === 0;

  const getAmount = (
    arr: { currency: string; amount: number }[],
    currency: string
  ) => arr.find((item) => item.currency === currency)?.amount || 0;

  const renderStatCard = (
    title: string,
    value: number,
    icon: ReactNode,
    formatter: Intl.NumberFormat
  ) => (
    <StartCard formatter={formatter} title={title} value={value} icon={icon} />
  );

  const renderStatCardsForCurrency = (currency: string) => {
    const income = getAmount(incomeData, currency);
    const expense = getAmount(expenseData, currency);
    const balance = income - expense;
    const formatter = GetFormatterForCurrency(currency);

    return (
      <div key={currency} className="flex gap-4 flex-col sm:flex-row">
        {renderStatCard(
          `Income (${currency})`,
          income,
          <TrendingUp className="h-8 w-8 text-emerald-500 bg-emerald-400/10 rounded-lg p-1.5" />,
          formatter
        )}
        {renderStatCard(
          `Expense (${currency})`,
          expense,
          <TrendingDown className="h-8 w-8 text-red-500 bg-red-400/10 rounded-lg p-1.5" />,
          formatter
        )}
        {renderStatCard(
          `Balance (${currency})`,
          balance,
          <Wallet className="h-8 w-8 text-violet-500 bg-violet-400/10 rounded-lg p-1.5" />,
          formatter
        )}
      </div>
    );
  };

  return (
    <div className="relative flex w-full gap-2">
      <SkeletonWrapper isLoading={isFetching}>
        <div className="flex flex-col w-full gap-4">
          {isEmpty ? (
            <div className="flex gap-4 flex-col sm:flex-row">
              {["Income", "Expense", "Balance"].map((title) =>
                renderStatCard(
                  `${title} (${userSetting.currency})`,
                  0,
                  title === "Income" ? (
                    <TrendingUp className="h-8 w-8 text-emerald-500 bg-emerald-400/10 rounded-lg p-1.5" />
                  ) : title === "Expense" ? (
                    <TrendingDown className="h-8 w-8 text-red-500 bg-red-400/10 rounded-lg p-1.5" />
                  ) : (
                    <Wallet className="h-8 w-8 text-violet-500 bg-violet-400/10 rounded-lg p-1.5" />
                  ),
                  GetFormatterForCurrency(userSetting.currency)
                )
              )}
            </div>
          ) : (
            allCurrencies.map(renderStatCardsForCurrency)
          )}
        </div>
      </SkeletonWrapper>
    </div>
  );
};

const StartCard = ({
  formatter,
  value,
  title,
  icon,
}: {
  formatter: Intl.NumberFormat;
  icon: ReactNode;
  title: string;
  value: number;
}) => {
  const formatFn = useCallback(
    (value: number) => formatter.format(value),
    [formatter]
  );

  return (
    <Card className="flex flex-row h-24 w-full items-center gap-2 p-4">
      {icon}
      <div className="flex flex-col items-center gap-0">
        <p className="text-muted-foreground capitalize">{title}</p>
        <CountUp
          preserveValue
          redraw={false}
          end={value}
          decimals={2}
          formattingFn={formatFn}
          className="text-2xl"
        />
      </div>
    </Card>
  );
};

export default StatsCards;
