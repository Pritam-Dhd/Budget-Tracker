"use client";

import { GetHistoryPeriodsResponseType } from "@/app/api/history-periods/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Period, TimeFrame } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

interface Props {
  period: Period;
  setPeriod: (period: Period) => void;
  timeFrame: TimeFrame;
  setTimeFrame: (timeFrame: TimeFrame) => void;
  currency: string;
  setCurrency: (currency: string) => void;
}

const HistoryPeriodSelector = ({
  period,
  setPeriod,
  timeFrame,
  setTimeFrame,
  currency,
  setCurrency,
}: Props) => {
  const historyPeriod = useQuery<GetHistoryPeriodsResponseType>({
    queryKey: ["overview", "history", "periods"],
    queryFn: () =>
      fetch(`api/history-periods`)
        .then((res) => res.json())
        .catch((err) => console.error(err)),
  });

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SkeletonWrapper isLoading={historyPeriod.isFetching} fullWidth={false}>
        <Tabs
          value={timeFrame}
          onValueChange={(value) => setTimeFrame(value as TimeFrame)}
        >
          <TabsList>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </SkeletonWrapper>
      <div className="flex flex-wrap items-center gap-2">
        <SkeletonWrapper isLoading={historyPeriod.isFetching} fullWidth={false}>
          <YearSelector
            period={period}
            setPeriod={setPeriod}
            years={historyPeriod.data || []}
            currency={currency}
            setCurrency={setCurrency}
          />
        </SkeletonWrapper>
        {timeFrame === "month" && (
          <SkeletonWrapper
            isLoading={historyPeriod.isFetching}
            fullWidth={false}
          >
            <MonthSelector
              period={period}
              setPeriod={setPeriod}
              months={historyPeriod.data || []}
            />
          </SkeletonWrapper>
        )}
      </div>
    </div>
  );
};

export default HistoryPeriodSelector;

function YearSelector({
  period,
  setPeriod,
  years,
  currency,
  setCurrency,
}: {
  period: Period;
  setPeriod: (period: Period) => void;
  years: GetHistoryPeriodsResponseType;
  currency: string;
  setCurrency: (currency: string) => void;
}) {
  // Group years by the year value to avoid duplicates in the year selector
  const groupedYears = years.reduce(
    (acc: Record<number, string[]>, { year, currency }) => {
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(currency);
      return acc;
    },
    {}
  );

  return (
    <div className="flex gap-4">
      {/* Year Select */}
      <Select
        value={period.year.toString()}
        onValueChange={(value) => {
          const newYear = parseInt(value);
          setPeriod({ month: period.month, year: newYear });
          setCurrency(""); // Reset currency when changing year
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(groupedYears).map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Currency Select */}
      <Select
        value={currency}
        onValueChange={(currency) => setCurrency(currency)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Currency" />
        </SelectTrigger>
        <SelectContent>
          {groupedYears[period.year]?.map((currency) => (
            <SelectItem key={currency} value={currency}>
              {currency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function MonthSelector({
  period,
  setPeriod,
  months,
}: {
  period: Period;
  setPeriod: (period: Period) => void;
  months: GetHistoryPeriodsResponseType;
}) {
  return (
    <Select
      value={period.month.toString()}
      onValueChange={(value) => {
        const newMonth = parseInt(value);
        setPeriod({ year: period.year, month: newMonth });
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Month" />
      </SelectTrigger>
      <SelectContent>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((month) => {
          const monthStr = new Date(period.year, month, 1).toLocaleString(
            "default",
            { month: "long" }
          );
          return (
            <SelectItem key={month} value={month.toString()}>
              {monthStr}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
