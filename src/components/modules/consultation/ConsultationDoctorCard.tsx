"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentBookingViewerRole } from "@/types/appointment.types";
import { IDoctor } from "@/types/doctor.types";
import { Building2, DollarSign, Star, Stethoscope, Trophy } from "lucide-react";
import Link from "next/link";
import React from "react";
import ConsultationBookAppointmentSheet from "./ConsultationBookAppointmentSheet";
import {
    formatDoctorExperience,
    formatDoctorFee,
    formatDoctorRating,
    getDoctorInitials,
    getDoctorSpecialtyTitles,
} from "./consultationDoctorUtils";

type ConsultationDoctorCardProps = {
    doctor: IDoctor;
    viewerRole?: AppointmentBookingViewerRole;
};

const ConsultationDoctorCard = ({ doctor, viewerRole = null }: ConsultationDoctorCardProps) => {
    const specialtyTitles = getDoctorSpecialtyTitles(doctor);
    const visibleSpecialties = specialtyTitles.slice(0, 3);
    const remainingSpecialtiesCount = Math.max(specialtyTitles.length - visibleSpecialties.length, 0);

    return (
        <Card className="h-full overflow-hidden border-border/70 bg-card/95 py-0 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
            <CardContent className="flex h-full flex-col gap-5 p-5">
                <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border bg-muted/60">
                        <AvatarImage src={doctor.profilePhoto || ""} alt={doctor.name} />
                        <AvatarFallback className="font-semibold">
                            {getDoctorInitials(doctor.name)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="space-y-1">
                            <h3 className="line-clamp-2 text-lg font-semibold">{doctor.name}</h3>
                            <p className="text-sm text-muted-foreground">{doctor.designation || "Doctor"}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="capitalize">
                                {doctor.gender.toLowerCase()}
                            </Badge>
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                {formatDoctorRating(doctor.averageRating)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex min-h-12 flex-wrap gap-2">
                    {visibleSpecialties.length > 0 ? (
                        <>
                            {visibleSpecialties.map((specialtyTitle) => (
                                <Badge key={specialtyTitle} variant="outline" className="rounded-full px-3 py-1">
                                    {specialtyTitle}
                                </Badge>
                            ))}
                            {remainingSpecialtiesCount > 0 && (
                                <Badge variant="outline" className="rounded-full px-3 py-1">
                                    +{remainingSpecialtiesCount} more
                                </Badge>
                            )}
                        </>
                    ) : (
                        <Badge variant="outline" className="rounded-full px-3 py-1">
                            Specialty not listed
                        </Badge>
                    )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border bg-muted/25 p-3">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            <Trophy className="h-3.5 w-3.5" />
                            Experience
                        </div>
                        <p className="mt-2 text-sm font-semibold">
                            {formatDoctorExperience(doctor.experience)}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-muted/25 p-3">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            <DollarSign className="h-3.5 w-3.5" />
                            Fee
                        </div>
                        <p className="mt-2 text-sm font-semibold">
                            {formatDoctorFee(doctor.appointmentFee)}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-muted/25 p-3">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            <Stethoscope className="h-3.5 w-3.5" />
                            Rating
                        </div>
                        <p className="mt-2 text-sm font-semibold">
                            {formatDoctorRating(doctor.averageRating)} / 5.0
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border bg-sky-50/60 p-3">
                    <div className="flex items-start gap-2">
                        <Building2 className="mt-0.5 h-4 w-4 text-sky-700" />
                        <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wide text-sky-700">
                                Working Place
                            </p>
                            <p className="line-clamp-2 text-sm text-slate-700">
                                {doctor.currentWorkingPlace || "Details will be shared on the profile page."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-auto grid gap-2 sm:grid-cols-2">
                    <ConsultationBookAppointmentSheet
                        doctor={doctor}
                        viewerRole={viewerRole}
                        triggerClassName="w-full"
                    />

                    <Button asChild variant="outline" className="w-full">
                        <Link href={`/consultation/doctor/${doctor.id}`}>
                            View Details
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ConsultationDoctorCard;
