import DoctorsList from "@/components/modules/consultation/DoctorsList";
import {
    buildDoctorsQueryString,
    DoctorsQueryParams,
} from "@/components/modules/Admin/DoctorsManagement/doctorsQueryParams";
import { appendDoctorIncludeQuery } from "@/components/modules/consultation/consultationDoctorUtils";
import { getDoctors } from "@/services/doctor.services";
import { getSpecialties } from "@/services/specialty.services";
import { getUserInfo } from "@/services/auth.services";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export const ConsultationPage = async (
    {
        searchParams,
    }: {
        searchParams: Promise<DoctorsQueryParams>;
    },
) => {
    const queryParamsObject = await searchParams;
    const normalizedQueryParamsObject: DoctorsQueryParams = {
        ...queryParamsObject,
        sortBy: queryParamsObject.sortBy ?? "averageRating",
        sortOrder: queryParamsObject.sortOrder ?? "desc",
    };
    const queryString = buildDoctorsQueryString(normalizedQueryParamsObject);
    const apiQueryString = appendDoctorIncludeQuery(queryString, "doctorSchedules");
    const queryClient = new QueryClient();
    const user = await getUserInfo();

    try {
        await queryClient.prefetchQuery({
            queryKey: ["doctors", apiQueryString],
            queryFn: () => getDoctors(apiQueryString),
            staleTime: 1000 * 60 * 5,
        });
    } catch {
        // Let the client render the public error state.
    }

    try {
        await queryClient.prefetchQuery({
            queryKey: ["specialties"],
            queryFn: getSpecialties,
            staleTime: 1000 * 60 * 10,
        });
    } catch {
        // Filters can recover client-side if specialties fail to prefetch.
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <DoctorsList viewerRole={user?.role ?? null} />
        </HydrationBoundary>
    );
};

export default ConsultationPage;
