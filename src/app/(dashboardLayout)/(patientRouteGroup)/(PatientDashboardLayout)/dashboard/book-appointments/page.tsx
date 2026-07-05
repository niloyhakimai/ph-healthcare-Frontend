import BookAppointmentConfirmation from "@/components/modules/appointments/BookAppointmentConfirmation";
import { parseBookAppointmentSelectionFromSearchParams } from "@/components/modules/appointments/appointmentUtils";
import React from "react";

export const BookAppointmentPage = async (
    {
        searchParams,
    }: {
        searchParams: Promise<Record<string, string | string[] | undefined>>;
    },
) => {
    const resolvedSearchParams = await searchParams;
    const selection = parseBookAppointmentSelectionFromSearchParams(resolvedSearchParams);

    return <BookAppointmentConfirmation selection={selection} />;
};

export default BookAppointmentPage;
