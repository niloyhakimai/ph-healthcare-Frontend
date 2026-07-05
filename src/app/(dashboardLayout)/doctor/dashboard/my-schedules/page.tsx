import DoctorShedulesTable from "@/components/modules/Doctor/DoctorsSchedules/DoctorShedulesTable";
import {
  buildDoctorSchedulesQueryString,
  DoctorSchedulesQueryParams,
} from "@/components/modules/Doctor/DoctorsSchedules/doctorSchedulesQueryParams";
import { getMyDoctorSchedules } from "@/services/doctorSchedule.services";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import React from "react";

const MySchedulesPage = async (
  {
    searchParams,
  }: {
    searchParams: Promise<DoctorSchedulesQueryParams>;
  },
) => {
  const queryParamsObject = await searchParams;
  const queryString = buildDoctorSchedulesQueryString(queryParamsObject);
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["my-doctor-schedules", queryString],
    queryFn: () => getMyDoctorSchedules(queryString),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 6,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DoctorShedulesTable />
    </HydrationBoundary>
  );
};

export default MySchedulesPage;
