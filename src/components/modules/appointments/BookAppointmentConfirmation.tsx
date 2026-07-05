"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    bookAppointmentClient,
    bookAppointmentWithPayLaterClient,
} from "@/services/appointment.client";
import { BookAppointmentSelection } from "@/types/appointment.types";
import { useMutation } from "@tanstack/react-query";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    CreditCard,
    Loader2,
    Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import {
    formatAppointmentDateTime,
    formatAppointmentTimeRange,
    STRIPE_LINK_HELPER_MESSAGE,
} from "./appointmentUtils";

type BookAppointmentConfirmationProps = {
    selection: BookAppointmentSelection | null;
};

const BookAppointmentConfirmation = ({ selection }: BookAppointmentConfirmationProps) => {
    const router = useRouter();
    const [pageLoadedAt] = React.useState(() => Date.now());
    const slotEndTime = selection ? new Date(selection.endDateTime).getTime() : Number.NaN;
    const isSelectionExpired = selection ? Number.isFinite(slotEndTime) && slotEndTime < pageLoadedAt : false;

    const payNowMutation = useMutation({
        mutationFn: bookAppointmentClient,
    });
    const payLaterMutation = useMutation({
        mutationFn: bookAppointmentWithPayLaterClient,
    });

    const handlePayNow = async () => {
        if (!selection) {
            toast.error("No appointment selection is available.");
            return;
        }

        try {
            const response = await payNowMutation.mutateAsync({
                doctorId: selection.doctorId,
                scheduleId: selection.scheduleId,
            });
            const paymentUrl = response.data.paymentUrl;

            if (!paymentUrl) {
                toast.error("Payment gateway URL was not returned.");
                return;
            }

            window.location.assign(paymentUrl);
        } catch (error) {
            toast.error(
                error && typeof error === "object" && "message" in error && typeof error.message === "string"
                    ? error.message
                    : "Unable to continue to payment right now.",
            );
        }
    };

    const handlePayLater = async () => {
        if (!selection) {
            toast.error("No appointment selection is available.");
            return;
        }

        try {
            const response = await payLaterMutation.mutateAsync({
                doctorId: selection.doctorId,
                scheduleId: selection.scheduleId,
            });
            const appointmentId = response.data.appointment.id;

            router.push(`/dashboard/my-appointments?booked=pay_later&appointmentId=${appointmentId}`);
        } catch (error) {
            toast.error(
                error && typeof error === "object" && "message" in error && typeof error.message === "string"
                    ? error.message
                    : "Unable to book the appointment right now.",
            );
        }
    };

    if (!selection) {
        return (
            <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 md:px-6">
                <Button asChild variant="ghost" className="w-fit px-0 text-muted-foreground hover:bg-transparent">
                    <Link href="/consultation">
                        <ArrowLeft className="h-4 w-4" />
                        Back to consultation
                    </Link>
                </Button>

                <Alert variant="destructive">
                    <AlertTitle>Booking details are missing</AlertTitle>
                    <AlertDescription>
                        Choose a doctor slot from the consultation page first, then come back here to confirm the appointment.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 md:px-6">
            <Button asChild variant="ghost" className="w-fit px-0 text-muted-foreground hover:bg-transparent">
                <Link href={`/consultation/doctor/${selection.doctorId}`}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to doctor profile
                </Link>
            </Button>

            <section className="overflow-hidden rounded-3xl border bg-gradient-to-br from-sky-50 via-background to-emerald-50">
                <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Badge variant="secondary" className="rounded-full px-3 py-1">
                                Patient Booking
                            </Badge>
                            <h1 className="text-3xl font-semibold tracking-tight">
                                Confirm Your Appointment
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                Review the selected doctor and schedule details below, then choose whether you want to pay now or pay later.
                            </p>
                        </div>

                        <Card className="border-border/70 bg-card/90 py-0">
                            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                                <Avatar className="h-16 w-16 border bg-muted/50">
                                    <AvatarImage src={selection.doctorProfilePhoto || ""} alt={selection.doctorName} />
                                    <AvatarFallback className="font-semibold">
                                        {selection.doctorName
                                            .split(" ")
                                            .map((part) => part[0])
                                            .join("")
                                            .slice(0, 2)
                                            .toUpperCase() || "DR"}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="space-y-1">
                                    <h2 className="text-xl font-semibold">{selection.doctorName}</h2>
                                    <p className="text-sm text-muted-foreground">
                                        {selection.doctorDesignation || "Consultation specialist"}
                                    </p>
                                    <p className="text-sm font-medium">
                                        Fee: {typeof selection.appointmentFee === "number"
                                            ? `$${selection.appointmentFee.toFixed(2)}`
                                            : "N/A"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="py-0">
                        <CardHeader className="border-b">
                            <CardTitle>Selected Time Slot</CardTitle>
                            <CardDescription>
                                This slot will be reserved once you confirm the booking.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="rounded-2xl border bg-muted/20 p-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <CalendarDays className="h-4 w-4" />
                                    Appointment Date
                                </div>
                                <p className="mt-2 font-semibold">
                                    {formatAppointmentDateTime(selection.startDateTime, "EEEE, MMM dd, yyyy")}
                                </p>
                            </div>

                            <div className="rounded-2xl border bg-muted/20 p-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Clock3 className="h-4 w-4" />
                                    Appointment Time
                                </div>
                                <p className="mt-2 font-semibold">
                                    {formatAppointmentTimeRange(selection.startDateTime, selection.endDateTime)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {isSelectionExpired && (
                <Alert variant="destructive">
                    <AlertTitle>This slot has already passed</AlertTitle>
                    <AlertDescription>
                        Select a newer appointment slot from the consultation page before continuing.
                    </AlertDescription>
                </Alert>
            )}

            <section className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Pay Now
                        </CardTitle>
                        <CardDescription>
                            Confirm the booking and continue directly to the payment gateway.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                            Stripe checkout will open after the appointment and payment record are created.
                        </div>

                        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
                            {STRIPE_LINK_HELPER_MESSAGE}
                        </div>

                        <Button
                            type="button"
                            className="w-full"
                            onClick={handlePayNow}
                            disabled={isSelectionExpired || payNowMutation.isPending || payLaterMutation.isPending}
                        >
                            {payNowMutation.isPending ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Redirecting to Payment...
                                </>
                            ) : (
                                "Confirm and Pay Now"
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Pay Later
                        </CardTitle>
                        <CardDescription>
                            Reserve the appointment now and complete payment later from your appointments page.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                            The slot will still be booked for you, and you can use the Pay Now button later from the appointment card.
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handlePayLater}
                            disabled={isSelectionExpired || payLaterMutation.isPending || payNowMutation.isPending}
                        >
                            {payLaterMutation.isPending ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Booking Appointment...
                                </>
                            ) : (
                                "Book with Pay Later"
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </section>

            <Card>
                <CardHeader>
                    <CardTitle>What happens next</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3 rounded-2xl border p-4">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                        <div>
                            <p className="font-medium">Booking confirmation is created immediately</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                The selected doctor slot is reserved during booking so another patient cannot take it.
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3 rounded-2xl border p-4">
                        <Wallet className="mt-0.5 h-5 w-5 text-sky-600" />
                        <div>
                            <p className="font-medium">Pay later stays visible in My Appointments</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                If you skip payment now, you can reopen the appointment later and continue to Stripe from your dashboard.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BookAppointmentConfirmation;
