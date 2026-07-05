import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppointmentBookingViewerRole } from "@/types/appointment.types";
import { IDoctorDetails, IDoctorReview } from "@/types/doctor.types";
import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarClock,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    Star,
    Trophy,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import {
    formatConsultationDateTime,
    formatDoctorExperience,
    formatDoctorFee,
    formatDoctorRating,
    getDoctorInitials,
    getDoctorSpecialtyTitles,
    getReviewAuthorName,
    getReviewDateLabel,
    getUpcomingOpenDoctorSchedules,
} from "./consultationDoctorUtils";
import ConsultationBookAppointmentSheet from "./ConsultationBookAppointmentSheet";

type ConsultationDoctorDetailsProps = {
    doctor: IDoctorDetails | null;
    detailAccessMessage?: string | null;
    notFoundMessage?: string | null;
    usedPublicFallback?: boolean;
    viewerRole?: AppointmentBookingViewerRole;
};

const ReviewStars = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
            <Star
                key={index}
                className={`h-4 w-4 ${index < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
            />
        ))}
    </div>
);

const ConsultationDoctorDetails = ({
    detailAccessMessage,
    doctor,
    notFoundMessage,
    usedPublicFallback = false,
    viewerRole = null,
}: ConsultationDoctorDetailsProps) => {
    const specialtyTitles = doctor ? getDoctorSpecialtyTitles(doctor) : [];
    const upcomingSchedules = getUpcomingOpenDoctorSchedules(doctor);
    const reviews = [...(doctor?.reviews ?? [])].sort((left: IDoctorReview, right: IDoctorReview) => {
        const leftTime = new Date(left.createdAt ?? 0).getTime();
        const rightTime = new Date(right.createdAt ?? 0).getTime();

        return rightTime - leftTime;
    });
    const nextAvailableSlot = upcomingSchedules[0]?.schedule;

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 md:px-6 lg:px-8">
            <Button asChild variant="ghost" className="w-fit px-0 text-muted-foreground hover:bg-transparent">
                <Link href="/consultation">
                    <ArrowLeft className="h-4 w-4" />
                    Back to doctors
                </Link>
            </Button>

            {!doctor ? (
                <Alert variant="destructive">
                    <AlertTitle>Doctor not found</AlertTitle>
                    <AlertDescription>
                        {notFoundMessage || "The doctor profile you requested is not available."}
                    </AlertDescription>
                </Alert>
            ) : (
                <>
                    {detailAccessMessage && (
                        <Alert>
                            <AlertTitle>Showing public profile details</AlertTitle>
                            <AlertDescription>
                                <p>{detailAccessMessage}</p>
                                {usedPublicFallback && (
                                    <p>
                                        Public profile data is available here, but full review details still depend on the backend detail endpoint being opened up.
                                    </p>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    <section className="overflow-hidden rounded-3xl border bg-gradient-to-br from-sky-50 via-background to-emerald-50">
                        <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.9fr] lg:p-8">
                            <div className="flex flex-col gap-6 md:flex-row">
                                <Avatar className="h-24 w-24 border bg-card shadow-sm">
                                    <AvatarImage src={doctor.profilePhoto || ""} alt={doctor.name} />
                                    <AvatarFallback className="text-lg font-semibold">
                                        {getDoctorInitials(doctor.name)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 space-y-4">
                                    <div className="space-y-2">
                                        <Badge variant="secondary" className="rounded-full px-3 py-1">
                                            Consultation Specialist
                                        </Badge>
                                        <h1 className="text-3xl font-semibold tracking-tight">{doctor.name}</h1>
                                        <p className="text-base text-muted-foreground">
                                            {doctor.designation || "Doctor"} at {doctor.currentWorkingPlace || "Healthcare provider"}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {specialtyTitles.length > 0 ? (
                                            specialtyTitles.map((specialtyTitle) => (
                                                <Badge key={specialtyTitle} variant="outline" className="rounded-full px-3 py-1">
                                                    {specialtyTitle}
                                                </Badge>
                                            ))
                                        ) : (
                                            <Badge variant="outline" className="rounded-full px-3 py-1">
                                                Specialty not listed
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-2xl border bg-card/80 p-4 shadow-sm">
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Rating
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                                <span className="text-lg font-semibold">
                                                    {formatDoctorRating(doctor.averageRating)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border bg-card/80 p-4 shadow-sm">
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Experience
                                            </p>
                                            <p className="mt-2 text-lg font-semibold">
                                                {formatDoctorExperience(doctor.experience)}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border bg-card/80 p-4 shadow-sm">
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Appointment Fee
                                            </p>
                                            <p className="mt-2 text-lg font-semibold">
                                                {formatDoctorFee(doctor.appointmentFee)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-1">
                                        <ConsultationBookAppointmentSheet
                                            doctor={doctor}
                                            viewerRole={viewerRole}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Card className="border-border/70 bg-card/90 py-0">
                                <CardHeader className="border-b">
                                    <CardTitle>Availability Snapshot</CardTitle>
                                    <CardDescription>
                                        Based on doctor schedules available from the backend.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    <div className="rounded-2xl border bg-muted/25 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Upcoming Open Slots
                                        </p>
                                        <p className="mt-2 text-3xl font-semibold">
                                            {String(upcomingSchedules.length)}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border bg-muted/25 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Next Available Slot
                                        </p>
                                        <p className="mt-2 text-sm font-medium">
                                            {nextAvailableSlot
                                                ? formatConsultationDateTime(nextAvailableSlot.startDateTime, "EEEE, MMM dd, yyyy hh:mm a")
                                                : "No upcoming slot published yet"}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Professional Overview</CardTitle>
                                    <CardDescription>
                                        A closer look at the doctor&apos;s background and consultation profile.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-2xl border p-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                <Trophy className="h-4 w-4" />
                                                Qualification
                                            </div>
                                            <p className="mt-2 font-medium">
                                                {doctor.qualification || "Not provided"}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border p-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                <ShieldCheck className="h-4 w-4" />
                                                Registration Number
                                            </div>
                                            <p className="mt-2 font-medium">
                                                {doctor.registrationNumber || "Not provided"}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border p-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                <BriefcaseBusiness className="h-4 w-4" />
                                                Designation
                                            </div>
                                            <p className="mt-2 font-medium">
                                                {doctor.designation || "Not provided"}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border p-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                <CalendarClock className="h-4 w-4" />
                                                Joined
                                            </div>
                                            <p className="mt-2 font-medium">
                                                {formatConsultationDateTime(doctor.createdAt, "MMM dd, yyyy") || "Not available"}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="rounded-2xl border p-4">
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <BriefcaseBusiness className="h-4 w-4" />
                                            Current Working Place
                                        </div>
                                        <p className="mt-2 font-medium">
                                            {doctor.currentWorkingPlace || "Not provided"}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Patient Reviews</CardTitle>
                                    <CardDescription>
                                        {usedPublicFallback
                                            ? "Reviews are unavailable until the backend detail and review endpoints are public."
                                            : `${reviews.length} review${reviews.length === 1 ? "" : "s"} shared for this doctor.`}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {reviews.length > 0 ? (
                                        reviews.map((review) => (
                                            <div key={review.id} className="rounded-2xl border p-4">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <p className="font-medium">{getReviewAuthorName(review)}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {getReviewDateLabel(review) || "Review date unavailable"}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <ReviewStars rating={review.rating ?? 0} />
                                                        <span className="text-sm font-semibold">
                                                            {formatDoctorRating(review.rating)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                                    {review.comment?.trim() || "No written comment was provided for this review."}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                                            {usedPublicFallback
                                                ? "The public doctor profile is available, but review data is hidden by the backend right now."
                                                : "No reviews have been published for this doctor yet."}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                    <CardDescription>
                                        Details available on the doctor profile.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="rounded-2xl border p-4">
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                            Email
                                        </div>
                                        <p className="mt-2 break-all font-medium">
                                            {doctor.email || "Not provided"}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border p-4">
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                            Contact Number
                                        </div>
                                        <p className="mt-2 font-medium">
                                            {doctor.contactNumber || "Not provided"}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border p-4">
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            Address
                                        </div>
                                        <p className="mt-2 font-medium">
                                            {doctor.address || "Not provided"}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Facts</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between rounded-2xl border px-4 py-3">
                                        <span className="text-sm text-muted-foreground">Gender</span>
                                        <span className="font-medium capitalize">{doctor.gender.toLowerCase()}</span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-2xl border px-4 py-3">
                                        <span className="text-sm text-muted-foreground">Average Rating</span>
                                        <span className="font-medium">{formatDoctorRating(doctor.averageRating)} / 5.0</span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-2xl border px-4 py-3">
                                        <span className="text-sm text-muted-foreground">Upcoming Open Slots</span>
                                        <span className="font-medium">
                                            {upcomingSchedules.length}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-2xl border px-4 py-3">
                                        <span className="text-sm text-muted-foreground">Fee</span>
                                        <span className="font-medium">{formatDoctorFee(doctor.appointmentFee)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ConsultationDoctorDetails;
