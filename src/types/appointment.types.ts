export type AppointmentStatus =
    | "SCHEDULED"
    | "INPROGRESS"
    | "COMPLETED"
    | "CANCELED";

export type PaymentStatus = "PAID" | "UNPAID";

export type AppointmentBookingViewerRole =
    | "PATIENT"
    | "DOCTOR"
    | "ADMIN"
    | "SUPER_ADMIN"
    | null;

export interface IAppointmentDoctorSummary {
    id: string;
    name?: string;
    email?: string;
    profilePhoto?: string | null;
    contactNumber?: string | null;
    designation?: string | null;
    currentWorkingPlace?: string | null;
    appointmentFee?: number;
}

export interface IAppointmentPatientSummary {
    id: string;
    name?: string;
    email?: string;
}

export interface IAppointmentScheduleSummary {
    id: string;
    startDateTime: string;
    endDateTime: string;
}

export interface IAppointmentPaymentSummary {
    id: string;
    amount: number;
    transactionId: string;
    status: PaymentStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface IAppointment {
    id: string;
    doctorId: string;
    patientId?: string;
    scheduleId: string;
    status: AppointmentStatus;
    paymentStatus: PaymentStatus;
    videoCallingId?: string;
    createdAt: string;
    updatedAt?: string;
    doctor?: IAppointmentDoctorSummary;
    patient?: IAppointmentPatientSummary;
    schedule?: IAppointmentScheduleSummary;
    payment?: IAppointmentPaymentSummary | null;
}

export interface IBookAppointmentPayload {
    doctorId: string;
    scheduleId: string;
}

export interface IBookAppointmentResponseData {
    appointment: IAppointment;
    payment?: IAppointmentPaymentSummary | null;
    paymentUrl?: string | null;
}

export interface IInitiatePaymentResponseData {
    paymentUrl: string;
}

export interface BookAppointmentSelection {
    doctorId: string;
    scheduleId: string;
    doctorName: string;
    doctorDesignation?: string | null;
    doctorProfilePhoto?: string | null;
    appointmentFee?: number | null;
    startDateTime: string;
    endDateTime: string;
}
