"use client";
import { GetCategoriesStatsResponseType } from "@/app/api/stats/categories/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserSetting } from "@/generated/prisma";
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helper";
import { TransactionType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";

interface Props {
  from: Date;
  to: Date;
  userSetting: UserSetting;
}

const CategoriesStats = ({ userSetting, from, to }: Props) => {
  const statsQuery = useQuery<GetCategoriesStatsResponseType>({
    queryKey: ["overview", "stats", "categories", from, to],
    queryFn: () =>
      fetch(
        `/api/stats/categories?from=${DateToUTCDate(from)}&to=${DateToUTCDate(
          to
        )}`
      )
        .then((res) => res.json())
        .catch((err) => {
          console.error("Failed to fetch stats:", err);
        }),
  });

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSetting.currency);
  }, [userSetting.currency]);

  return (
    <div className="flex w-full flex-wrap gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <CategoriesCard
          formatter={formatter}
          type="income"
          data={statsQuery.data || []}
        />
        <CategoriesCard
          formatter={formatter}
          type="expense"
          data={statsQuery.data || []}
        />
      </SkeletonWrapper>
    </div>
  );
};

export default CategoriesStats;

function CategoriesCard({
  formatter,
  type,
  data,
}: {
  formatter: Intl.NumberFormat;
  type: TransactionType;
  data: GetCategoriesStatsResponseType;
}) {
  // Filter by income/expense type
  const filteredData = data.filter((e) => e.type === type);

  // Group data by currency
  const groupedByCurrency = filteredData.reduce((acc, item) => {
    if (!acc[item.currency]) acc[item.currency] = [];
    acc[item.currency].push(item);
    return acc;
  }, {} as Record<string, typeof filteredData>);

  return (
    <Card className="h-80 w-full col-span-6">
      <CardHeader>
        <CardTitle className="text-muted-foreground capitalize">
          {type}
        </CardTitle>
      </CardHeader>
      <div className="flex items-center justify-between gap-2">
        {filteredData.length === 0 ? (
          <div className="flex h-60 w-full flex-col items-center justify-center">
            No data for this selected period
            <p className="text-sm text-muted-foreground">
              Try selecting a different period or try adding new {type}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-60 w-full px-4">
            <div className="flex w-full flex-col gap-6 p-4">
              {Object.entries(groupedByCurrency).map(([currency, items]) => {
                const total = items.reduce(
                  (sum, item) => sum + (item._sum.amount || 0),
                  0
                );
                return (
                  <div key={currency} className="flex flex-col gap-4">
                    <span className="text-xs text-muted-foreground font-semibold">
                      {currency} Total: {formatter.format(total)}
                    </span>
                    {items.map((item) => {
                      const amount = item._sum.amount || 0;
                      const percentage = (amount / total) * 100;

                      return (
                        <div
                          key={`${item.category}-${currency}`}
                          className="flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-gray-400">
                              {item.categoryIcon}
                              {item.category}
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({percentage.toFixed(0)}%)
                              </span>
                            </span>
                            <span className="text-sm text-gray-600">
                              {formatter.format(amount)}
                            </span>
                          </div>
                          <Progress
                            value={percentage}
                            indicator={
                              type === "income"
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </Card>
  );
}
