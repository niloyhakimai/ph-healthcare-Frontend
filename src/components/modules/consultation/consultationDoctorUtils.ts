import { IDoctor, IDoctorReview } from "@/types/doctor.types";
import { format } from "date-fns";

export const getDoctorInitials = (name?: string) => {
    if (!name) {
        return "DR";
    }

    return name
        .split(" ")
        .map((segment) => segment[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

export const getDoctorSpecialtyTitles = (doctor: Pick<IDoctor, "specialties">) =>
    (doctor.specialties ?? [])
        .map((item) => item.specialty?.title)
        .filter((title): title is string => Boolean(title));

export const appendDoctorIncludeQuery = (queryString: string, includeKey: string) => {
    const searchParams = new URLSearchParams(queryString);
    const includeValues = new Set(
        (searchParams.get("include") ?? "")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
    );

    includeValues.add(includeKey);
    searchParams.set("include", Array.from(includeValues).join(","));

    return searchParams.toString();
};

export const formatDoctorFee = (fee?: number | null) =>
    typeof fee === "number" ? `$${fee.toFixed(2)}` : "N/A";

export const formatDoctorExperience = (experience?: number | null) =>
    `${experience ?? 0} year${experience === 1 ? "" : "s"}`;

export const formatDoctorRating = (rating?: number | null) =>
    typeof rating === "number" ? rating.toFixed(1) : "0.0";

export const formatConsultationDateTime = (
    value?: string | Date | null,
    formatString = "MMM dd, yyyy hh:mm a",
) => {
    if (!value) {
        return null;
    }

    const dateValue = new Date(value);

    if (Number.isNaN(dateValue.getTime())) {
        return null;
    }

    return format(dateValue, formatString);
};

export const getUpcomingOpenDoctorSchedules = (doctor?: Pick<IDoctor, "doctorSchedules"> | null) => {
    const now = new Date();

    return (doctor?.doctorSchedules ?? [])
        .filter((doctorSchedule) => {
            const endDateTime = doctorSchedule.schedule?.endDateTime;

            if (!endDateTime || doctorSchedule.isBooked) {
                return false;
            }

            const endDate = new Date(endDateTime);

            return !Number.isNaN(endDate.getTime()) && endDate >= now;
        })
        .sort((left, right) => {
            const leftDate = new Date(left.schedule?.startDateTime ?? 0).getTime();
            const rightDate = new Date(right.schedule?.startDateTime ?? 0).getTime();

            return leftDate - rightDate;
        });
};

export const getReviewAuthorName = (review: IDoctorReview) =>
    review.patient?.user?.name
    || review.patient?.name
    || "Verified patient";

export const getReviewDateLabel = (review: IDoctorReview) =>
    formatConsultationDateTime(review.createdAt, "MMM dd, yyyy");

export const getErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        return error.message;
    }

    return fallbackMessage;
};
