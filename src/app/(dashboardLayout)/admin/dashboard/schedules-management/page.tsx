import SchedulesTable from "@/components/modules/Admin/SchedulesManagement/SchedulesTable";
import {
  buildSchedulesQueryString,
  SchedulesQueryParams,
} from "@/components/modules/Admin/SchedulesManagement/schedulesQueryParams";
import { getSchedules } from "@/services/schedule.services";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import React from "react";

const SchedulesManagementPage = async (
  {
    searchParams,
  }: {
    searchParams: Promise<SchedulesQueryParams>;
  },
) => {
  const queryParamsObject = await searchParams;
  const queryString = buildSchedulesQueryString(queryParamsObject);
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["schedules", queryString],
    queryFn: () => getSchedules(queryString),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 6,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SchedulesTable />
    </HydrationBoundary>
  );
};

export default SchedulesManagementPage;
