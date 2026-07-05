import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock3, CreditCard, Stethoscope } from "lucide-react";
import Link from "next/link";
import React from "react";

const readSearchParamValue = (value?: string | string[]) => {
    if (Array.isArray(value)) {
        return value[0];
    }

    return value;
};

export const PaymentSuccessPage = async (
    {
        searchParams,
    }: {
        searchParams: Promise<Record<string, string | string[] | undefined>>;
    },
) => {
    const resolvedSearchParams = await searchParams;
    const appointmentId = readSearchParamValue(resolvedSearchParams.appointment_id);
    const paymentId = readSearchParamValue(resolvedSearchParams.payment_id);
    const paymentStatus = readSearchParamValue(resolvedSearchParams.payment_status);
    const confirmationError = readSearchParamValue(resolvedSearchParams.confirmation_error);
    const normalizedPaymentStatus = paymentStatus?.trim().toUpperCase();
    const hasConfirmationError = Boolean(
        confirmationError && confirmationError.trim() && confirmationError.trim().toLowerCase() !== "false",
    );
    const isPaid = normalizedPaymentStatus === "PAID";
    const isConfirmed = isPaid && !hasConfirmationError;
    const confirmationDetail = hasConfirmationError && confirmationError !== "true"
        ? confirmationError
        : null;
    const appointmentsHref = appointmentId
        ? `/dashboard/my-appointments?appointmentId=${appointmentId}&payment=success`
        : "/dashboard/my-appointments?payment=success";
    const statusIcon = isConfirmed
        ? <CheckCircle2 className="h-8 w-8" />
        : hasConfirmationError
            ? <AlertCircle className="h-8 w-8" />
            : <Clock3 className="h-8 w-8" />;
    const statusIconClassName = isConfirmed
        ? "bg-emerald-100 text-emerald-700"
        : hasConfirmationError
            ? "bg-amber-100 text-amber-700"
            : "bg-sky-100 text-sky-700";
    const badgeLabel = isConfirmed
        ? "Payment Complete"
        : hasConfirmationError
            ? "Confirmation Pending"
            : "Payment Processing";
    const pageTitle = isConfirmed
        ? "Appointment payment successful"
        : hasConfirmationError
            ? "Payment received, confirmation is still syncing"
            : "Payment status is still processing";
    const pageDescription = isConfirmed
        ? "The backend has confirmed your Stripe payment. Your appointment should now appear as paid in My Appointments."
        : hasConfirmationError
            ? "Stripe checkout finished, but the backend still needs a moment to finalize the paid state. Use the appointments page below to refresh the latest status."
            : "The backend is still verifying your latest payment update. You can open My Appointments to check the live status.";
    const confirmationLabel = isConfirmed
        ? "Confirmed"
        : hasConfirmationError
            ? "Pending backend confirmation"
            : "Processing";

    return (
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl items-center px-4 py-10 md:px-6">
            <Card className="w-full">
                <CardHeader className="items-center text-center">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-full ${statusIconClassName}`}>
                        {statusIcon}
                    </div>
                    <Badge variant="secondary" className="rounded-full px-3 py-1">
                        {badgeLabel}
                    </Badge>
                    <CardTitle className="text-3xl">{pageTitle}</CardTitle>
                    <CardDescription className="max-w-xl text-sm leading-6">
                        {pageDescription}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="grid gap-3 rounded-2xl border bg-muted/15 p-4 text-sm sm:grid-cols-2">
                        <div>
                            <p className="font-medium text-muted-foreground">Payment Status</p>
                            <p className="mt-1 font-semibold">{normalizedPaymentStatus || "PROCESSING"}</p>
                        </div>
                        <div>
                            <p className="font-medium text-muted-foreground">Confirmation</p>
                            <p className="mt-1 font-semibold">{confirmationLabel}</p>
                        </div>
                    </div>

                    {confirmationDetail && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                            Backend confirmation detail: {confirmationDetail}
                        </div>
                    )}

                    {(appointmentId || paymentId) && (
                        <div className="grid gap-3 rounded-2xl border bg-muted/15 p-4 text-sm sm:grid-cols-2">
                            <div>
                                <p className="font-medium text-muted-foreground">Appointment ID</p>
                                <p className="mt-1 break-all font-mono text-xs">{appointmentId || "Not provided"}</p>
                            </div>
                            <div>
                                <p className="font-medium text-muted-foreground">Payment ID</p>
                                <p className="mt-1 break-all font-mono text-xs">{paymentId || "Not provided"}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Button asChild className="w-full">
                            <Link href={appointmentsHref}>
                                <CreditCard className="size-4" />
                                View My Appointments
                            </Link>
                        </Button>

                        <Button asChild variant="outline" className="w-full">
                            <Link href="/consultation">
                                <Stethoscope className="size-4" />
                                Book Another Consultation
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentSuccessPage;
