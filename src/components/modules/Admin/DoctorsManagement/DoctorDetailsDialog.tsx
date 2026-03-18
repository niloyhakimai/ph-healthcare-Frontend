"use client";

import { getDoctorById } from "@/services/doctor.services";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React from "react";

type DoctorDetailsDialogProps = {
    doctorId: string | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
};

const DoctorDetailsDialog = ({ doctorId, isOpen, onOpenChange }: DoctorDetailsDialogProps) => {
    const { data: doctorResponse, isLoading } = useQuery({
        queryKey: ["doctor", doctorId],
        queryFn: () => (doctorId ? getDoctorById(doctorId) : Promise.resolve(null)),
        enabled: isOpen && !!doctorId,
    });

    const doctor = doctorResponse?.data;

    const getInitials = (name?: string) => {
        if (!name) return "DR";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                <SheetHeader className="border-b mb-4">
                    <SheetTitle>Doctor Details</SheetTitle>
                    <SheetDescription>View doctor profile information</SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p>Loading doctor information...</p>
                        </div>
                    </div>
                ) : !doctor ? (
                    <div className="text-center py-4 text-muted-foreground">
                        Failed to load doctor information.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Header with Profile Info */}
                        <div className="flex gap-4 items-start">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={doctor.profilePhoto || ""} alt={doctor.name} />
                                <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div>
                                    <h2 className="text-2xl font-bold">{doctor.name}</h2>
                                    <p className="text-muted-foreground">{doctor.designation}</p>
                                </div>
                                <div className="mt-2 flex gap-2 items-center">
                                    <Badge variant="default">{doctor.gender}</Badge>
                                    <Badge variant="secondary">{doctor.user.status}</Badge>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{doctor.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Contact Number</p>
                                        <p className="font-medium">{doctor.contactNumber || "N/A"}</p>
                                    </div>
                                </div>
                                {doctor.address && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Address</p>
                                        <p className="font-medium">{doctor.address}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Professional Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Professional Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Registration Number</p>
                                        <p className="font-medium">{doctor.registrationNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Experience</p>
                                        <p className="font-medium">{doctor.experience} years</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Qualification</p>
                                        <p className="font-medium">{doctor.qualification}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Appointment Fee</p>
                                        <p className="font-medium">
                                            {doctor.appointmentFee ? `$${doctor.appointmentFee.toFixed(2)}` : "N/A"}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Current Working Place</p>
                                    <p className="font-medium">{doctor.currentWorkingPlace}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Specialties */}
                        {doctor.specialties && doctor.specialties.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Specialties</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {doctor.specialties.map((specialty, index) => (
                                            <Badge key={index} variant="secondary">
                                                {specialty.specialty?.title || "Unknown"}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Rating */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Rating</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">
                                    {doctor.averageRating ? doctor.averageRating.toFixed(1) : "0.0"} / 5.0
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default DoctorDetailsDialog;
