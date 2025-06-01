"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSetting } from "@/generated/prisma";
import { GetFormatterForCurrency } from "@/lib/helper";
import { Period, TimeFrame } from "@/lib/types";
import React, { useCallback, useMemo, useState } from "react";
import HistoryPeriodSelector from "./HistoryPeriodSelector";
import { useQuery } from "@tanstack/react-query";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import CountUp from "react-countup";

const History = ({ userSetting }: { userSetting: UserSetting }) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("month");
  const [period, setPeriod] = useState<Period>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [currency, setCurrency] = useState("");

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSetting.currency);
  }, [userSetting.currency]);

  const historyDataQuery = useQuery({
    queryKey: ["overview", "history", timeFrame, period, currency],
    queryFn: () =>
      fetch(
        `/api/history-data?timeframe=${timeFrame}&year=${period.year}&month=${period.month}&currency=${currency}`
      )
        .then((res) => res.json())
        .catch((err) => console.error(err)),
  });

  const dataAvailable =
    historyDataQuery.data && historyDataQuery.data.length > 0;

  return (
    <div className="flex w-full mt-12">
      <Card className="col-span-12 w-full">
        <CardHeader className="gap-2">
          <CardTitle className="grid grid-flow-row justify-between gap-2 md:grid-flow-col">
            <HistoryPeriodSelector
              period={period}
              setPeriod={setPeriod}
              timeFrame={timeFrame}
              setTimeFrame={setTimeFrame}
              currency={currency}
              setCurrency={setCurrency}
            />
            <div className="flex h-10 gap-2">
              <Badge
                className="flex items-center gap-2 text-sm"
                variant={"outline"}
              >
                <div className="h-4 w-4 rounded-full bg-emerald-500"></div>
                Income
              </Badge>
              <Badge
                className="flex items-center gap-2 text-sm"
                variant={"outline"}
              >
                <div className="h-4 w-4 rounded-full bg-red-500"></div>
                Expense
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SkeletonWrapper isLoading={historyDataQuery.isFetching}>
            {dataAvailable && (
              <ResponsiveContainer width={"100%"} height={300}>
                <BarChart
                  height={300}
                  data={historyDataQuery.data}
                  barCategoryGap={5}
                >
                  <defs>
                    <linearGradient
                      id="incomeBar"
                      x1="0"
                      x2={"0"}
                      y1={"0"}
                      y2={"1"}
                    >
                      <stop
                        offset={"0"}
                        stopColor="#10b981"
                        stopOpacity={"1"}
                      />
                      <stop
                        offset={"1"}
                        stopColor="#10b981"
                        stopOpacity={"0"}
                      />
                    </linearGradient>
                    <linearGradient
                      id="expenseBar"
                      x1="0"
                      x2={"0"}
                      y1={"0"}
                      y2={"1"}
                    >
                      <stop
                        offset={"0"}
                        stopColor="#ef4444"
                        stopOpacity={"1"}
                      />
                      <stop
                        offset={"1"}
                        stopColor="#ef4444"
                        stopOpacity={"0"}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray={"5.5"}
                    strokeOpacity={"0.2"}
                    vertical={false}
                  />
                  <XAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    padding={{ left: 5, right: 5 }}
                    dataKey={(data) => {
                      const { year, month, day } = data;
                      const date = new Date(year, month, day || 1);
                      if (timeFrame === "year") {
                        return date.toLocaleString("default", {
                          month: "long",
                        });
                      }
                      return date.toLocaleString("default", { day: "2-digit" });
                    }}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Bar
                    dataKey={"income"}
                    label={"Income"}
                    fill="url(#incomeBar)"
                    radius={4}
                    className="cursor-pointer"
                  />
                  <Bar
                    dataKey={"expense"}
                    label={"Expense"}
                    fill="url(#expenseBar)"
                    radius={4}
                    className="cursor-pointer"
                  />
                  <Tooltip
                    cursor={{ opacity: 0.1 }}
                    content={(props) => (
                      <CustomTooltip
                        formatter={formatter}
                        {...props}
                      ></CustomTooltip>
                    )}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
            {!dataAvailable && (
              <Card className="flex h-[300px] flex-col items-center justify-center bg-background">
                No data for this selected period or currency
                <p className="text-sm text-muted-foreground">
                  Try selectiong a different period or currency or adding new
                  transaction
                </p>
              </Card>
            )}
          </SkeletonWrapper>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;

function CustomTooltip({ active, payload, formatter }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  const { expense, income } = data;

  return (
    <div className="min-w-[300px] rounded border bg-background p-4">
      <TooltopRow
        formatter={formatter}
        label="Expense"
        value={expense}
        bgColor="bg-red-500"
        textColor="text-red-500"
      />
      <TooltopRow
        formatter={formatter}
        label="Income"
        value={income}
        bgColor="bg-emerald-500"
        textColor="text-emerald-500"
      />
      <TooltopRow
        formatter={formatter}
        label="Balance"
        value={income - expense}
        bgColor="bg-gray-500"
        textColor="text-foregroung"
      />
    </div>
  );
}

function TooltopRow({
  label,
  value,
  bgColor,
  textColor,
  formatter,
}: {
  label: string;
  value: number;
  bgColor: string;
  textColor: string;
  formatter: Intl.NumberFormat;
}) {
  const formattingFn = useCallback(
    (value: number) => {
      return formatter.format(value);
    },
    [formatter]
  );
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-4 w-4 rounded-full", bgColor)} />
      <div className="flex- w-full justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={(cn("text-sm font-bold"), textColor)}>
          <CountUp
            duration={0.5}
            preserveValue
            end={value}
            decimals={0}
            formattingFn={formattingFn}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
