import DoctorsTable from '@/components/modules/Admin/DoctorsManagement/DoctorsTable';
import { buildDoctorsQueryString, DoctorsQueryParams } from '@/components/modules/Admin/DoctorsManagement/doctorsQueryParams';
import { getDoctors } from '@/services/doctor.services';
import { getSpecialties } from '@/services/specialty.services';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import React from 'react'

const DoctorsManagementPage = async (
      {
        searchParams,
      }: {
      searchParams: Promise<DoctorsQueryParams>
    }
) => {
  const queryParamsObject = await searchParams;
  const queryString = buildDoctorsQueryString(queryParamsObject);
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["doctors", queryString],
      queryFn: () => getDoctors(queryString),
      staleTime: 1000 * 60 * 60,
      gcTime : 1000 * 60 * 60 * 6,
    }),
    queryClient.prefetchQuery({
      queryKey: ["specialties"],
      queryFn: getSpecialties,
      staleTime: 1000 * 60 * 60,
      gcTime : 1000 * 60 * 60 * 6,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DoctorsTable />
    </HydrationBoundary>
  )
}

export default DoctorsManagementPage;
