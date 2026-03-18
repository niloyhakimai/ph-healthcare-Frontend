import { CreateDoctorPayload, Gender, UpdateDoctorPayload } from "@/types/doctor.types";
import { z } from "zod";

const optionalAddressSchema = z
    .string()
    .trim()
    .refine(
        (value) => value.length === 0 || (value.length >= 10 && value.length <= 100),
        {
            message: "Address must be between 10 and 100 characters",
        },
    );

const optionalExperienceSchema = z
    .string()
    .trim()
    .refine(
        (value) => value.length === 0 || (/^\d+$/.test(value) && Number(value) >= 0),
        {
            message: "Experience must be a non-negative integer",
        },
    );

const appointmentFeeSchema = z
    .string()
    .trim()
    .min(1, "Appointment fee is required")
    .refine((value) => value !== "" && !Number.isNaN(Number(value)) && Number(value) >= 0, {
        message: "Appointment fee must be a non-negative number",
    });

export const createDoctorFormSchema = z.object({
    password: z
        .string()
        .trim()
        .min(6, "Password must be at least 6 characters")
        .max(20, "Password cannot exceed 20 characters"),
    name: z
        .string()
        .trim()
        .min(5, "Name must be at least 5 characters")
        .max(30, "Name cannot exceed 30 characters"),
    email: z.email({ message: "Invalid email address" }),
    contactNumber: z
        .string()
        .trim()
        .min(11, "Contact number must be at least 11 characters")
        .max(14, "Contact number cannot exceed 14 characters"),
    address: optionalAddressSchema,
    registrationNumber: z.string().trim().min(1, "Registration number is required"),
    experience: optionalExperienceSchema,
    gender: z.enum([Gender.MALE, Gender.FEMALE]),
    appointmentFee: appointmentFeeSchema,
    qualification: z
        .string()
        .trim()
        .min(2, "Qualification must be at least 2 characters")
        .max(50, "Qualification cannot exceed 50 characters"),
    currentWorkingPlace: z
        .string()
        .trim()
        .min(2, "Current working place must be at least 2 characters")
        .max(50, "Current working place cannot exceed 50 characters"),
    designation: z
        .string()
        .trim()
        .min(2, "Designation must be at least 2 characters")
        .max(50, "Designation cannot exceed 50 characters"),
    specialties: z
        .array(z.string().uuid("Please select a valid specialty"))
        .min(1, "Select at least one specialty"),
});

export type CreateDoctorFormValues = z.infer<typeof createDoctorFormSchema>;

export const defaultCreateDoctorFormValues: CreateDoctorFormValues = {
    password: "",
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    registrationNumber: "",
    experience: "",
    gender: Gender.MALE,
    appointmentFee: "",
    qualification: "",
    currentWorkingPlace: "",
    designation: "",
    specialties: [],
};

export const mapCreateDoctorFormValuesToPayload = (
    values: CreateDoctorFormValues,
): CreateDoctorPayload => ({
    password: values.password.trim(),
    doctor: {
        name: values.name.trim(),
        email: values.email.trim(),
        contactNumber: values.contactNumber.trim(),
        address: values.address.trim() ? values.address.trim() : undefined,
        registrationNumber: values.registrationNumber.trim(),
        experience: values.experience.trim() ? Number(values.experience.trim()) : undefined,
        gender: values.gender,
        appointmentFee: Number(values.appointmentFee.trim()),
        qualification: values.qualification.trim(),
        currentWorkingPlace: values.currentWorkingPlace.trim(),
        designation: values.designation.trim(),
    },
    specialties: values.specialties,
});

// Edit Doctor Validation Schema
const optionalNameSchema = z
    .string()
    .trim()
    .refine(
        (value) => value.length === 0 || (value.length >= 5 && value.length <= 30),
        {
            message: "Name must be between 5 and 30 characters",
        },
    );

const optionalContactNumberSchema = z
    .string()
    .trim()
    .refine(
        (value) => value.length === 0 || (value.length >= 11 && value.length <= 14),
        {
            message: "Contact number must be between 11 and 14 characters",
        },
    );

const optionalQualificationSchema = z
    .string()
    .trim()
    .refine(
        (value) => value.length === 0 || (value.length >= 2 && value.length <= 50),
        {
            message: "Qualification must be between 2 and 50 characters",
        },
    );

const optionalCurrentWorkingPlaceSchema = z
    .string()
    .trim()
    .refine(
        (value) => value.length === 0 || (value.length >= 2 && value.length <= 50),
        {
            message: "Current working place must be between 2 and 50 characters",
        },
    );

const optionalDesignationSchema = z
    .string()
    .trim()
    .refine(
        (value) => value.length === 0 || (value.length >= 2 && value.length <= 50),
        {
            message: "Designation must be between 2 and 50 characters",
        },
    );

const optionalAppointmentFeeSchema = z
    .string()
    .trim()
    .refine((value) => value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0), {
        message: "Appointment fee must be a non-negative number",
    });

export const editDoctorFormSchema = z.object({
    name: optionalNameSchema,
    profilePhoto: z.string().trim().optional(),
    contactNumber: optionalContactNumberSchema,
    address: optionalAddressSchema,
    registrationNumber: z.string().trim(),
    experience: optionalExperienceSchema,
    gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
    appointmentFee: optionalAppointmentFeeSchema,
    qualification: optionalQualificationSchema,
    currentWorkingPlace: optionalCurrentWorkingPlaceSchema,
    designation: optionalDesignationSchema,
    specialties: z
        .array(
            z.object({
                specialtyId: z.string().uuid("Please select a valid specialty"),
                shouldDelete: z.boolean().optional(),
            })
        )
        .optional(),
});

export type EditDoctorFormValues = z.infer<typeof editDoctorFormSchema>;

export const createDefaultEditDoctorFormValues = (doctor: {
    name?: string;
    profilePhoto?: string | null;
    contactNumber?: string | null;
    address?: string | null;
    registrationNumber?: string;
    experience?: number;
    gender?: string;
    appointmentFee?: number;
    qualification?: string;
    currentWorkingPlace?: string;
    designation?: string;
    specialties?: Array<{ specialtyId: string; specialty?: { title: string } }>;
}): EditDoctorFormValues => ({
    name: doctor.name || "",
    profilePhoto: doctor.profilePhoto || "",
    contactNumber: doctor.contactNumber || "",
    address: doctor.address || "",
    registrationNumber: doctor.registrationNumber || "",
    experience: doctor.experience ? String(doctor.experience) : "",
    gender: (doctor.gender as any) || Gender.MALE,
    appointmentFee: doctor.appointmentFee ? String(doctor.appointmentFee) : "",
    qualification: doctor.qualification || "",
    currentWorkingPlace: doctor.currentWorkingPlace || "",
    designation: doctor.designation || "",
    specialties: doctor.specialties?.map((spec) => ({
        specialtyId: spec.specialtyId,
    })) || [],
});

export const mapEditDoctorFormValuesToPayload = (
    values: EditDoctorFormValues,
    originalDoctor: {
        name?: string;
        profilePhoto?: string | null;
        contactNumber?: string | null;
        address?: string | null;
        registrationNumber?: string;
        experience?: number;
        gender?: string;
        appointmentFee?: number;
        qualification?: string;
        currentWorkingPlace?: string;
        designation?: string;
        specialties?: Array<{ specialtyId: string }>;
    },
): UpdateDoctorPayload => {
    const doctor: Record<string, any> = {};
    const originalSpecialties = originalDoctor.specialties?.map((s) => s.specialtyId) || [];

    if (values.name.trim() && values.name !== originalDoctor.name) {
        doctor.name = values.name.trim();
    }

    if (values.profilePhoto.trim() && values.profilePhoto !== originalDoctor.profilePhoto) {
        doctor.profilePhoto = values.profilePhoto.trim();
    }

    if (values.contactNumber.trim() && values.contactNumber !== originalDoctor.contactNumber) {
        doctor.contactNumber = values.contactNumber.trim();
    }

    if (values.address.trim() && values.address.trim() !== originalDoctor.address) {
        doctor.address = values.address.trim();
    } else if (!values.address.trim() && originalDoctor.address) {
        doctor.address = "";
    }

    if (values.registrationNumber.trim() && values.registrationNumber !== originalDoctor.registrationNumber) {
        doctor.registrationNumber = values.registrationNumber.trim();
    }

    const experienceNum = values.experience.trim() ? Number(values.experience.trim()) : undefined;
    if (experienceNum !== undefined && experienceNum !== originalDoctor.experience) {
        doctor.experience = experienceNum;
    } else if (!values.experience.trim() && originalDoctor.experience !== undefined) {
        doctor.experience = undefined;
    }

    if (values.gender && values.gender !== originalDoctor.gender) {
        doctor.gender = values.gender;
    }

    const feeNum = values.appointmentFee.trim() ? Number(values.appointmentFee.trim()) : undefined;
    if (feeNum !== undefined && feeNum !== originalDoctor.appointmentFee) {
        doctor.appointmentFee = feeNum;
    }

    if (values.qualification.trim() && values.qualification !== originalDoctor.qualification) {
        doctor.qualification = values.qualification.trim();
    }

    if (values.currentWorkingPlace.trim() && values.currentWorkingPlace !== originalDoctor.currentWorkingPlace) {
        doctor.currentWorkingPlace = values.currentWorkingPlace.trim();
    }

    if (values.designation.trim() && values.designation !== originalDoctor.designation) {
        doctor.designation = values.designation.trim();
    }

    const payload: UpdateDoctorPayload = {
        doctor: Object.keys(doctor).length > 0 ? doctor : undefined,
        specialties: values.specialties && values.specialties.length > 0 ? values.specialties : undefined,
    };

    return payload;
};
