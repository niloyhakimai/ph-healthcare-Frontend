"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    getMyAppointmentsClient,
    initiateAppointmentPaymentClient,
} from "@/services/appointment.client";
import { IAppointment } from "@/types/appointment.types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    CalendarDays,
    CreditCard,
    Loader2,
    SearchX,
    Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
    canRetryAppointmentPayment,
    formatAppointmentDateTime,
    formatAppointmentTimeRange,
    getEffectivePaymentStatus,
    getAppointmentStatusClassName,
    getAppointmentStatusLabel,
    getPaymentStatusClassName,
    getPaymentStatusLabel,
    isUpcomingAppointment,
    STRIPE_LINK_HELPER_MESSAGE,
} from "./appointmentUtils";

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        return error.message;
    }

    return fallbackMessage;
};

const LoadingAppointments = () => (
    <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
                <CardContent className="space-y-4 pt-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-14 w-14 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-56" />
                        </div>
                    </div>
                    <Skeleton className="h-20 w-full rounded-2xl" />
                </CardContent>
            </Card>
        ))}
    </div>
);

const sortAppointments = (appointments: IAppointment[]) =>
    [...appointments].sort((left, right) => {
        const leftUpcoming = isUpcomingAppointment(left);
        const rightUpcoming = isUpcomingAppointment(right);

        if (leftUpcoming !== rightUpcoming) {
            return leftUpcoming ? -1 : 1;
        }

        const leftStart = new Date(left.schedule?.startDateTime ?? left.createdAt ?? 0).getTime();
        const rightStart = new Date(right.schedule?.startDateTime ?? right.createdAt ?? 0).getTime();

        return rightStart - leftStart;
    });

const PatientAppointmentsList = () => {
    const searchParams = useSearchParams();
    const highlightedAppointmentId = searchParams.get("appointmentId");
    const paymentError = searchParams.get("error");
    const bookedState = searchParams.get("booked");
    const paymentState = searchParams.get("payment");

    const {
        data: appointmentsResponse,
        error,
        isError,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["patient-my-appointments"],
        queryFn: getMyAppointmentsClient,
        staleTime: paymentState === "success" ? 0 : 1000 * 30,
        refetchOnMount: paymentState === "success" ? "always" : true,
    });
    const previousPaymentStateRef = useRef(paymentState);

    useEffect(() => {
        if (paymentState === "success" && previousPaymentStateRef.current !== "success") {
            void refetch();
        }

        previousPaymentStateRef.current = paymentState;
    }, [paymentState, refetch]);

    const appointments = useMemo(
        () => sortAppointments(appointmentsResponse?.data ?? []),
        [appointmentsResponse?.data],
    );
    const upcomingCount = appointments.filter((appointment) => isUpcomingAppointment(appointment)).length;
    const unpaidCount = appointments.filter(
        (appointment) => getEffectivePaymentStatus(appointment) === "UNPAID",
    ).length;

    const payNowMutation = useMutation({
        mutationFn: initiateAppointmentPaymentClient,
    });

    const handlePayNow = async (appointmentId: string) => {
        try {
            const response = await payNowMutation.mutateAsync(appointmentId);
            window.location.assign(response.data.paymentUrl);
        } catch (mutationError) {
            toast.error(getErrorMessage(mutationError, "Unable to open payment right now."));
        }
    };

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 md:px-6">
            <section className="overflow-hidden rounded-3xl border bg-gradient-to-br from-sky-50 via-background to-emerald-50">
                <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between lg:p-8">
                    <div className="space-y-3">
                        <Badge variant="secondary" className="rounded-full px-3 py-1">
                            Patient Dashboard
                        </Badge>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight">My Appointments</h1>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                Review your scheduled consultations, track payment status, and reopen unpaid appointments whenever you&apos;re ready.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <Card className="min-w-40 py-0">
                            <CardContent className="p-5">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Total
                                </p>
                                <p className="mt-2 text-3xl font-semibold">{appointments.length}</p>
                            </CardContent>
                        </Card>
                        <Card className="min-w-40 py-0">
                            <CardContent className="p-5">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Upcoming
                                </p>
                                <p className="mt-2 text-3xl font-semibold">{upcomingCount}</p>
                            </CardContent>
                        </Card>
                        <Card className="min-w-40 py-0">
                            <CardContent className="p-5">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Unpaid
                                </p>
                                <p className="mt-2 text-3xl font-semibold">{unpaidCount}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {bookedState === "pay_later" && (
                <Alert>
                    <AlertTitle>Appointment booked successfully</AlertTitle>
                    <AlertDescription>
                        Your appointment is reserved. You can pay now from the highlighted card whenever you&apos;re ready.
                    </AlertDescription>
                </Alert>
            )}

            {paymentError === "payment_cancelled" && (
                <Alert variant="destructive">
                    <AlertTitle>Payment was cancelled</AlertTitle>
                    <AlertDescription>
                        Your appointment is still listed here. You can restart payment from the unpaid appointment card below.
                    </AlertDescription>
                </Alert>
            )}

            {paymentState === "success" && (
                <Alert>
                    <AlertTitle>Payment confirmed</AlertTitle>
                    <AlertDescription>
                        Your appointments have been refreshed with the latest backend payment status. The highlighted appointment should now show as paid.
                    </AlertDescription>
                </Alert>
            )}

            {isLoading ? (
                <LoadingAppointments />
            ) : isError ? (
                <Alert variant="destructive">
                    <AlertTitle>Unable to load appointments</AlertTitle>
                    <AlertDescription>
                        {getErrorMessage(error, "Your appointments could not be loaded right now.")}
                    </AlertDescription>
                </Alert>
            ) : appointments.length > 0 ? (
                <div className="grid gap-4">
                    {appointments.map((appointment) => {
                        const isHighlighted = appointment.id === highlightedAppointmentId;
                        const isPayingThisAppointment = payNowMutation.isPending && payNowMutation.variables === appointment.id;
                        const effectivePaymentStatus = getEffectivePaymentStatus(appointment);

                        return (
                            <Card
                                key={appointment.id}
                                className={isHighlighted ? "border-primary shadow-md" : undefined}
                            >
                                <CardContent className="space-y-5 pt-6">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-14 w-14 border bg-muted/50">
                                                <AvatarImage
                                                    src={appointment.doctor?.profilePhoto || ""}
                                                    alt={appointment.doctor?.name || "Doctor"}
                                                />
                                                <AvatarFallback className="font-semibold">
                                                    {(appointment.doctor?.name || "DR")
                                                        .split(" ")
                                                        .map((part) => part[0])
                                                        .join("")
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="space-y-1">
                                                <h2 className="text-lg font-semibold">
                                                    {appointment.doctor?.name || "Doctor"}
                                                </h2>
                                                <p className="text-sm text-muted-foreground">
                                                    {appointment.doctor?.designation || "Consultation specialist"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Appointment ID: {appointment.id}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge className={getAppointmentStatusClassName(appointment.status)}>
                                                {getAppointmentStatusLabel(appointment.status)}
                                            </Badge>
                                            <Badge className={getPaymentStatusClassName(effectivePaymentStatus)}>
                                                {getPaymentStatusLabel(effectivePaymentStatus)}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-3">
                                        <div className="rounded-2xl border bg-muted/20 p-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                <CalendarDays className="h-4 w-4" />
                                                Date
                                            </div>
                                            <p className="mt-2 font-semibold">
                                                {formatAppointmentDateTime(appointment.schedule?.startDateTime, "EEEE, MMM dd, yyyy") || "Not available"}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border bg-muted/20 p-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                <CalendarDays className="h-4 w-4" />
                                                Time
                                            </div>
                                            <p className="mt-2 font-semibold">
                                                {formatAppointmentTimeRange(
                                                    appointment.schedule?.startDateTime,
                                                    appointment.schedule?.endDateTime,
                                                ) || "Not available"}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border bg-muted/20 p-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                <CreditCard className="h-4 w-4" />
                                                Fee
                                            </div>
                                            <p className="mt-2 font-semibold">
                                                {typeof appointment.doctor?.appointmentFee === "number"
                                                    ? `$${appointment.doctor.appointmentFee.toFixed(2)}`
                                                    : "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="text-sm text-muted-foreground">
                                                Booked on {formatAppointmentDateTime(appointment.createdAt, "MMM dd, yyyy hh:mm a") || "N/A"}
                                            </p>

                                            {canRetryAppointmentPayment(appointment) ? (
                                                <Button
                                                    type="button"
                                                    onClick={() => handlePayNow(appointment.id)}
                                                    disabled={payNowMutation.isPending}
                                                >
                                                    {isPayingThisAppointment ? (
                                                        <>
                                                            <Loader2 className="size-4 animate-spin" />
                                                            Opening Payment...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CreditCard className="size-4" />
                                                            Pay Now
                                                        </>
                                                    )}
                                                </Button>
                                            ) : (
                                                <Button asChild variant="outline">
                                                    <Link href="/consultation">
                                                        <Stethoscope className="size-4" />
                                                        Book Another
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>

                                        {canRetryAppointmentPayment(appointment) && (
                                            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3 text-xs leading-5 text-sky-900">
                                                {STRIPE_LINK_HELPER_MESSAGE}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
                        <div className="rounded-full bg-muted p-3">
                            <SearchX className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No appointments booked yet</h3>
                        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                            Visit the consultation page, choose a doctor, and book your first appointment from an available schedule slot.
                        </p>
                        <Button asChild className="mt-6">
                            <Link href="/consultation">Explore Doctors</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PatientAppointmentsList;
