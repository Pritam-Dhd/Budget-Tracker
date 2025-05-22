"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSetting } from "@/generated/prisma";
import { GetFormatterForCurrency } from "@/lib/helper";
import { Period, TimeFrame } from "@/lib/types";
import React, { useMemo, useState } from "react";
import HistoryPeriodSelector from "./HistoryPeriodSelector";

const History = ({ userSetting }: { userSetting: UserSetting }) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("month");
  const [period, setPeriod] = useState<Period>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSetting.currency);
  }, [userSetting.currency]);

  return (
    <div className="container">
      <h2 className="mt-12 text-3xl font-bold">
        <Card className="col-span-12 mt-2 w-full">
          <CardHeader className="gap-2">
            <CardTitle className="grid grid-flow-row justify-between gap-2 md:grid-flow-col">
              <HistoryPeriodSelector
                period={period}
                setPeriod={setPeriod}
                timeFrame={timeFrame}
                setTimeFrame={setTimeFrame}
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
        </Card>
      </h2>
    </div>
  );
};

export default History;
