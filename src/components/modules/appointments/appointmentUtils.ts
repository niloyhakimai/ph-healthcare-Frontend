import {
    AppointmentStatus,
    BookAppointmentSelection,
    IAppointment,
    PaymentStatus,
} from "@/types/appointment.types";
import { IDoctor, IDoctorScheduleSummary } from "@/types/doctor.types";
import { format } from "date-fns";

const getSafeDate = (value?: string | Date | null) => {
    if (!value) {
        return null;
    }

    const dateValue = new Date(value);

    if (Number.isNaN(dateValue.getTime())) {
        return null;
    }

    return dateValue;
};

const readSearchParamValue = (value?: string | string[]) => {
    if (Array.isArray(value)) {
        return value[0] ?? "";
    }

    return value ?? "";
};

export const formatAppointmentDateTime = (
    value?: string | Date | null,
    formatString = "EEEE, MMM dd, yyyy",
) => {
    const dateValue = getSafeDate(value);

    if (!dateValue) {
        return null;
    }

    return format(dateValue, formatString);
};

export const formatAppointmentTimeRange = (
    startDateTime?: string | Date | null,
    endDateTime?: string | Date | null,
) => {
    const startDate = getSafeDate(startDateTime);
    const endDate = getSafeDate(endDateTime);

    if (!startDate || !endDate) {
        return null;
    }

    return `${format(startDate, "hh:mm a")} - ${format(endDate, "hh:mm a")}`;
};

export const buildBookAppointmentSelection = (
    doctor: Pick<IDoctor, "id" | "name" | "designation" | "profilePhoto" | "appointmentFee">,
    doctorSchedule: IDoctorScheduleSummary,
): BookAppointmentSelection | null => {
    const startDateTime = doctorSchedule.schedule?.startDateTime;
    const endDateTime = doctorSchedule.schedule?.endDateTime;

    if (!startDateTime || !endDateTime) {
        return null;
    }

    return {
        doctorId: String(doctor.id),
        scheduleId: doctorSchedule.scheduleId || doctorSchedule.schedule?.id || doctorSchedule.id,
        doctorName: doctor.name,
        doctorDesignation: doctor.designation,
        doctorProfilePhoto: doctor.profilePhoto ?? null,
        appointmentFee: doctor.appointmentFee,
        startDateTime,
        endDateTime,
    };
};

export const buildBookAppointmentHref = (selection: BookAppointmentSelection) => {
    const searchParams = new URLSearchParams({
        doctorId: selection.doctorId,
        scheduleId: selection.scheduleId,
        doctorName: selection.doctorName,
        startDateTime: selection.startDateTime,
        endDateTime: selection.endDateTime,
    });

    if (selection.doctorDesignation?.trim()) {
        searchParams.set("doctorDesignation", selection.doctorDesignation.trim());
    }

    if (selection.doctorProfilePhoto?.trim()) {
        searchParams.set("doctorProfilePhoto", selection.doctorProfilePhoto.trim());
    }

    if (typeof selection.appointmentFee === "number" && Number.isFinite(selection.appointmentFee)) {
        searchParams.set("appointmentFee", String(selection.appointmentFee));
    }

    return `/dashboard/book-appointments?${searchParams.toString()}`;
};

export const buildBookingLoginHref = (selection: BookAppointmentSelection) =>
    `/login?redirect=${encodeURIComponent(buildBookAppointmentHref(selection))}`;

export const parseBookAppointmentSelectionFromSearchParams = (
    searchParams: Record<string, string | string[] | undefined>,
): BookAppointmentSelection | null => {
    const doctorId = readSearchParamValue(searchParams.doctorId).trim();
    const scheduleId = readSearchParamValue(searchParams.scheduleId).trim();
    const startDateTime = readSearchParamValue(searchParams.startDateTime).trim();
    const endDateTime = readSearchParamValue(searchParams.endDateTime).trim();

    if (!doctorId || !scheduleId || !startDateTime || !endDateTime) {
        return null;
    }

    const appointmentFeeValue = Number(readSearchParamValue(searchParams.appointmentFee));

    return {
        doctorId,
        scheduleId,
        doctorName: readSearchParamValue(searchParams.doctorName).trim() || "Selected doctor",
        doctorDesignation: readSearchParamValue(searchParams.doctorDesignation).trim() || null,
        doctorProfilePhoto: readSearchParamValue(searchParams.doctorProfilePhoto).trim() || null,
        appointmentFee: Number.isFinite(appointmentFeeValue) ? appointmentFeeValue : null,
        startDateTime,
        endDateTime,
    };
};

export const getAppointmentStatusLabel = (status?: AppointmentStatus | string | null) => {
    switch (status) {
        case "SCHEDULED":
            return "Scheduled";
        case "INPROGRESS":
            return "In Progress";
        case "COMPLETED":
            return "Completed";
        case "CANCELED":
            return "Canceled";
        default:
            return status || "Unknown";
    }
};

export const getAppointmentStatusClassName = (status?: AppointmentStatus | string | null) => {
    switch (status) {
        case "COMPLETED":
            return "bg-emerald-100 text-emerald-800";
        case "INPROGRESS":
            return "bg-sky-100 text-sky-800";
        case "CANCELED":
            return "bg-rose-100 text-rose-800";
        case "SCHEDULED":
        default:
            return "bg-amber-100 text-amber-800";
    }
};

export const getPaymentStatusLabel = (status?: PaymentStatus | string | null) => {
    switch (status) {
        case "PAID":
            return "Paid";
        case "UNPAID":
            return "Unpaid";
        default:
            return status || "Unknown";
    }
};

export const getPaymentStatusClassName = (status?: PaymentStatus | string | null) => {
    switch (status) {
        case "PAID":
            return "bg-emerald-100 text-emerald-800";
        case "UNPAID":
        default:
            return "bg-slate-100 text-slate-800";
    }
};

export const STRIPE_LINK_HELPER_MESSAGE =
    "If Stripe Link asks for phone verification and you did not register a Link phone number, click 'Pay without Link' to continue card payment.";

export const getEffectivePaymentStatus = (
    appointment: Pick<IAppointment, "paymentStatus" | "payment">,
) => appointment.payment?.status ?? appointment.paymentStatus;

export const canRetryAppointmentPayment = (appointment: IAppointment) =>
    getEffectivePaymentStatus(appointment) === "UNPAID" && appointment.status !== "CANCELED";

export const isUpcomingAppointment = (appointment: IAppointment) => {
    const startDate = getSafeDate(appointment.schedule?.startDateTime);

    if (!startDate) {
        return false;
    }

    return startDate.getTime() >= Date.now();
};
