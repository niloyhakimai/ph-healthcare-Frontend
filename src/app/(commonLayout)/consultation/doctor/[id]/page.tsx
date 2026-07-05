import ConsultationDoctorDetails from "@/components/modules/consultation/ConsultationDoctorDetails";
import { appendDoctorIncludeQuery } from "@/components/modules/consultation/consultationDoctorUtils";
import { getUserInfo } from "@/services/auth.services";
import { getDoctors, getDoctorById } from "@/services/doctor.services";
import { IDoctorDetails } from "@/types/doctor.types";

const FALLBACK_PUBLIC_DOCTORS_LIMIT = 1000;

const getApiErrorStatus = (error: unknown) => {
    if (
        error
        && typeof error === "object"
        && "error" in error
        && error.error
        && typeof error.error === "object"
        && "statusCode" in error.error
        && typeof error.error.statusCode === "number"
    ) {
        return error.error.statusCode;
    }

    if (
        error
        && typeof error === "object"
        && "statusCode" in error
        && typeof error.statusCode === "number"
    ) {
        return error.statusCode;
    }

    return undefined;
};

const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        return error.message;
    }

    return fallbackMessage;
};

export const ConsultationDoctorByIdPage = async (
    {
        params,
    }: {
        params: Promise<{ id: string }>;
    },
) => {
    const { id } = await params;
    const user = await getUserInfo();
    let doctor: IDoctorDetails | null = null;
    let detailAccessMessage: string | null = null;
    let usedPublicFallback = false;
    let notFoundMessage: string | null = null;

    try {
        const doctorResponse = await getDoctorById(id);
        doctor = doctorResponse.data;
    } catch (error) {
        detailAccessMessage = getApiErrorMessage(
            error,
            "The full doctor detail endpoint is not publicly available right now.",
        );

        try {
            const doctorsResponse = await getDoctors(
                appendDoctorIncludeQuery(`limit=${FALLBACK_PUBLIC_DOCTORS_LIMIT}`, "doctorSchedules"),
            );
            const publicDoctors = doctorsResponse?.data ?? [];
            const matchedDoctor = publicDoctors.find((item) => String(item.id) === id);

            if (matchedDoctor) {
                doctor = {
                    ...matchedDoctor,
                    appointments: [],
                    doctorSchedules: matchedDoctor.doctorSchedules ?? [],
                    reviews: [],
                };
                usedPublicFallback = true;
            } else {
                notFoundMessage = "The doctor profile you requested is not available in the public consultation list.";
            }
        } catch (fallbackError) {
            notFoundMessage = getApiErrorMessage(
                fallbackError,
                getApiErrorStatus(error) === 403
                    ? "The doctor detail endpoint is private and the public fallback could not be loaded."
                    : "The doctor profile could not be loaded right now.",
            );
        }
    }

    return (
        <ConsultationDoctorDetails
            doctor={doctor}
            detailAccessMessage={detailAccessMessage}
            notFoundMessage={notFoundMessage}
            usedPublicFallback={usedPublicFallback}
            viewerRole={user?.role ?? null}
        />
    );
};

export default ConsultationDoctorByIdPage;
