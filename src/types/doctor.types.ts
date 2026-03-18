export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER"
}

export enum UserStatus {
    ACTIVE = "ACTIVE",
    BLOCKED = "BLOCKED",
    DELETED = "DELETED",
}

export interface IDoctor {
    id: string | number;
    name: string;
    email : string;
    profilePhoto ?: string;
    contactNumber?: string;
    address?: string;
    registrationNumber: string;
    gender: Gender;
    appointmentFee: number;
    qualification: string;
    currentWorkingPlace: string;
    designation: string;
    specialization: string;
    averageRating: number;
    createdAt: Date;
    user : {
        status : UserStatus
    }
    experience: number;
    specialties : Array<{
        specialtyId : string;
        doctorId : string;
        specialty : {
            id : string;
            title : string;
            icon : string;
        }
    }>
}

export type CreateDoctorGender = Gender.MALE | Gender.FEMALE;

export interface IDoctorDetails extends IDoctor {
    profilePhoto?: string | null;
    appointments?: unknown[];
    doctorSchedules?: unknown[];
    reviews?: unknown[];
}

export interface CreateDoctorPayload {
    password: string;
    doctor: {
        name: string;
        email: string;
        contactNumber: string;
        address?: string;
        registrationNumber: string;
        experience?: number;
        gender: CreateDoctorGender;
        appointmentFee: number;
        qualification: string;
        currentWorkingPlace: string;
        designation: string;
    };
    specialties: string[];
}

export interface CreateDoctorResponseData {
    id: string;
    userId: string;
    name: string;
    email: string;
    profilePhoto?: string | null;
    contactNumber?: string | null;
    address?: string | null;
    registrationNumber: string;
    experience: number;
    gender: CreateDoctorGender;
    appointmentFee: number;
    qualification: string;
    currentWorkingPlace: string;
    designation: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        status: string;
        emailVerified: boolean;
        image?: string | null;
        isDeleted: boolean;
        deletedAt?: string | null;
        createdAt: string;
        updatedAt: string;
    };
    specialties: Array<{
        specialty: {
            id: string;
            title: string;
        };
    }>;
}

export interface UpdateDoctorPayload {
    doctor?: {
        name?: string;
        profilePhoto?: string;
        contactNumber?: string;
        address?: string;
        registrationNumber?: string;
        experience?: number;
        gender?: CreateDoctorGender;
        appointmentFee?: number;
        qualification?: string;
        currentWorkingPlace?: string;
        designation?: string;
    };
    specialties?: Array<{
        specialtyId: string;
        shouldDelete?: true;
    }>;
}

export interface DeleteDoctorResponseData {
    message: string;
}
