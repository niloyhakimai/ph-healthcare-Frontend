"use client";

import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { getSpecialties } from "@/services/specialty.services";
import { getDoctorById, updateDoctor } from "@/services/doctor.services";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiErrorResponse, ApiErrorSource } from "@/types/api.types";
import { Gender, IDoctor } from "@/types/doctor.types";
import { ISpecialty } from "@/types/specialty.types";
import {
    editDoctorFormSchema,
    EditDoctorFormValues,
    createDefaultEditDoctorFormValues,
    mapEditDoctorFormValuesToPayload,
} from "@/zod/doctor.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useMemo, useState } from "react";

type EditDoctorSheetProps = {
    doctorId: string | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (message: string) => void;
};

type FormFieldName = keyof EditDoctorFormValues;
type FormFieldErrors = Partial<Record<FormFieldName, string>>;

const getFieldErrorMessage = (field: {
    state: {
        meta: {
            isTouched: boolean;
            errors: unknown[];
        };
    };
}) => {
    if (!field.state.meta.isTouched || field.state.meta.errors.length === 0) {
        return null;
    }

    const firstError = field.state.meta.errors[0];

    if (typeof firstError === "string") {
        return firstError;
    }

    if (
        firstError
        && typeof firstError === "object"
        && "message" in firstError
        && typeof firstError.message === "string"
    ) {
        return firstError.message;
    }

    return String(firstError);
};

const normalizeErrorPath = (path: string) =>
    path
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[._[\]]/g, "")
        .replace(/=>/g, "");

const getFieldNameFromApiErrorPath = (path: string): FormFieldName | null => {
    const normalizedPath = normalizeErrorPath(path);

    if (normalizedPath.includes("doctorname")) return "name";
    if (normalizedPath.includes("doctorprofilephoto")) return "profilePhoto";
    if (normalizedPath.includes("doctorcontactnumber")) return "contactNumber";
    if (normalizedPath.includes("doctoraddress")) return "address";
    if (normalizedPath.includes("doctorregistrationnumber")) return "registrationNumber";
    if (normalizedPath.includes("doctorexperience")) return "experience";
    if (normalizedPath.includes("doctorgender")) return "gender";
    if (normalizedPath.includes("doctorappointmentfee")) return "appointmentFee";
    if (normalizedPath.includes("doctorqualification")) return "qualification";
    if (normalizedPath.includes("doctorcurrentworkingplace")) return "currentWorkingPlace";
    if (normalizedPath.includes("doctordesignation")) return "designation";
    if (normalizedPath.includes("specialties")) return "specialties";

    return null;
};

const mapApiErrorsToFields = (errorSources?: ApiErrorSource[]): FormFieldErrors => {
    if (!errorSources?.length) {
        return {};
    }

    return errorSources.reduce<FormFieldErrors>((accumulator, errorSource) => {
        const fieldName = getFieldNameFromApiErrorPath(errorSource.path);

        if (fieldName && !accumulator[fieldName]) {
            accumulator[fieldName] = errorSource.message;
        }

        return accumulator;
    }, {});
};

const getApiErrorMessage = (error: unknown): ApiErrorResponse | null => {
    if (!error || typeof error !== "object") {
        return null;
    }

    if (
        "error" in error
        && error.error
        && typeof error.error === "object"
    ) {
        const nestedError = getApiErrorMessage(error.error);

        if (nestedError) {
            return nestedError;
        }
    }

    if ("message" in error && typeof error.message === "string") {
        return {
            success: false,
            message: error.message,
            errorSources:
                "errorSources" in error && Array.isArray(error.errorSources)
                    ? (error.errorSources as ApiErrorSource[])
                    : undefined,
        };
    }

    return null;
};

const FieldError = ({ message }: { message?: string | null }) => {
    if (!message) {
        return null;
    }

    return <p className="text-sm text-destructive">{message}</p>;
};

const EditDoctorSheet = ({ doctorId, isOpen, onOpenChange, onSuccess }: EditDoctorSheetProps) => {
    const queryClient = useQueryClient();
    const [serverError, setServerError] = useState<string | null>(null);
    const [serverFieldErrors, setServerFieldErrors] = useState<FormFieldErrors>({});

    // Fetch doctor data
    const { data: doctorResponse, isLoading: isDoctorLoading } = useQuery({
        queryKey: ["doctor", doctorId],
        queryFn: () => (doctorId ? getDoctorById(doctorId) : Promise.resolve(null)),
        enabled: isOpen && !!doctorId,
    });

    const doctor = doctorResponse?.data;

    // Fetch specialties
    const { data: specialtiesResponse, isLoading: isSpecialtiesLoading } = useQuery({
        queryKey: ["specialties"],
        queryFn: getSpecialties,
        enabled: isOpen,
    });

    const specialties = useMemo(
        () =>
            [...(specialtiesResponse?.data ?? [])].sort((left: ISpecialty, right: ISpecialty) =>
                left.title.localeCompare(right.title),
            ),
        [specialtiesResponse?.data],
    );

    const clearFormState = () => {
        setServerError(null);
        setServerFieldErrors({});
    };

    const form = useForm({
        defaultValues: createDefaultEditDoctorFormValues({}),
        onSubmit: async ({ value }) => {
            clearFormState();

            if (!doctorId || !doctor) {
                setServerError("Doctor data not found.");
                return;
            }

            const parsedValues = editDoctorFormSchema.safeParse(value);

            if (!parsedValues.success) {
                setServerError("Please review the form fields and try again.");
                return;
            }

            try {
                const payload = mapEditDoctorFormValuesToPayload(parsedValues.data, doctor);
                const response = await mutateAsync({ id: doctorId, payload });

                if (!response.success) {
                    setServerError(response.message || "Failed to update doctor.");
                    return;
                }

                clearFormState();
                onSuccess?.(response.message || "Doctor updated successfully");
                onOpenChange(false);

                await queryClient.invalidateQueries({ queryKey: ["doctors"] });
                await queryClient.invalidateQueries({ queryKey: ["doctor", doctorId] });
            } catch (error) {
                const apiError = getApiErrorMessage(error);

                if (apiError) {
                    setServerError(apiError.message);
                    setServerFieldErrors(mapApiErrorsToFields(apiError.errorSources));
                    return;
                }

                setServerError("Something went wrong while updating the doctor.");
            }
        },
    });

    const { mutateAsync, isPending } = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: ReturnType<typeof mapEditDoctorFormValuesToPayload> }) =>
            updateDoctor(id, payload),
    });

    // Reset form when doctor data loads
    React.useEffect(() => {
        if (doctor) {
            form.reset({
                values: createDefaultEditDoctorFormValues(doctor),
            });
        }
    }, [doctorId, form]);

    const handleOpenChange = (nextOpen: boolean) => {
        onOpenChange(nextOpen);

        if (!nextOpen) {
            clearFormState();
        }
    };

    const isLoading = isDoctorLoading || isSpecialtiesLoading;

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
                <SheetHeader className="border-b">
                    <SheetTitle>Edit Doctor</SheetTitle>
                    <SheetDescription>
                        Update doctor profile and specialties.
                    </SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p>Loading doctor information...</p>
                        </div>
                    </div>
                ) : !doctor ? (
                    <Alert variant="destructive" className="mt-4">
                        <AlertDescription>Failed to load doctor information.</AlertDescription>
                    </Alert>
                ) : (
                    <form
                        className="flex h-full flex-col"
                        noValidate
                        onSubmit={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            form.handleSubmit();
                        }}
                    >
                        <div className="flex-1 space-y-6 px-4 py-4">
                            {serverError && (
                                <Alert variant="destructive">
                                    <AlertDescription>{serverError}</AlertDescription>
                                </Alert>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                <form.Field
                                    name="name"
                                    validators={{ onChange: editDoctorFormSchema.shape.name }}
                                >
                                    {(field) => (
                                        <div className="space-y-1.5">
                                            <AppField
                                                field={field}
                                                label="Doctor Name"
                                                placeholder="Enter the doctor's full name"
                                            />
                                            <FieldError message={serverFieldErrors.name} />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field
                                    name="contactNumber"
                                    validators={{ onChange: editDoctorFormSchema.shape.contactNumber }}
                                >
                                    {(field) => (
                                        <div className="space-y-1.5">
                                            <AppField
                                                field={field}
                                                label="Contact Number"
                                                placeholder="Enter contact number"
                                            />
                                            <FieldError message={serverFieldErrors.contactNumber} />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field
                                    name="registrationNumber"
                                    validators={{ onChange: editDoctorFormSchema.shape.registrationNumber }}
                                >
                                    {(field) => (
                                        <div className="space-y-1.5">
                                            <AppField
                                                field={field}
                                                label="Registration Number"
                                                placeholder="Enter registration number"
                                            />
                                            <FieldError message={serverFieldErrors.registrationNumber} />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field
                                    name="experience"
                                    validators={{ onChange: editDoctorFormSchema.shape.experience }}
                                >
                                    {(field) => (
                                        <div className="space-y-1.5">
                                            <AppField
                                                field={field}
                                                label="Experience"
                                                type="number"
                                                placeholder="Years of experience"
                                            />
                                            <FieldError message={serverFieldErrors.experience} />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field
                                    name="appointmentFee"
                                    validators={{ onChange: editDoctorFormSchema.shape.appointmentFee }}
                                >
                                    {(field) => (
                                        <div className="space-y-1.5">
                                            <AppField
                                                field={field}
                                                label="Appointment Fee"
                                                type="number"
                                                placeholder="Enter appointment fee"
                                            />
                                            <FieldError message={serverFieldErrors.appointmentFee} />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field
                                    name="gender"
                                    validators={{ onChange: editDoctorFormSchema.shape.gender }}
                                >
                                    {(field) => (
                                        <div className="space-y-1.5">
                                            <Label htmlFor={field.name}>Gender</Label>
                                            <Select
                                                value={field.state.value || ""}
                                                onValueChange={(value) => field.handleChange(value as Gender)}
                                            >
                                                <SelectTrigger className="w-full" id={field.name}>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={Gender.MALE}>Male</SelectItem>
                                                    <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                                                    <SelectItem value={Gender.OTHER}>Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FieldError message={getFieldErrorMessage(field) || serverFieldErrors.gender} />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field
                                    name="qualification"
                                    validators={{ onChange: editDoctorFormSchema.shape.qualification }}
                                >
                                    {(field) => (
                                        <div className="space-y-1.5">
                                            <AppField
                                                field={field}
                                                label="Qualification"
                                                placeholder="Enter qualification"
                                            />
                                            <FieldError message={serverFieldErrors.qualification} />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field
                                    name="currentWorkingPlace"
                                    validators={{ onChange: editDoctorFormSchema.shape.currentWorkingPlace }}
                                >
                                    {(field) => (
                                        <div className="space-y-1.5">
                                            <AppField
                                                field={field}
                                                label="Current Working Place"
                                                placeholder="Enter current working place"
                                            />
                                            <FieldError message={serverFieldErrors.currentWorkingPlace} />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field
                                    name="designation"
                                    validators={{ onChange: editDoctorFormSchema.shape.designation }}
                                >
                                    {(field) => (
                                        <div className="space-y-1.5">
                                            <AppField
                                                field={field}
                                                label="Designation"
                                                placeholder="Enter designation"
                                            />
                                            <FieldError message={serverFieldErrors.designation} />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field
                                    name="address"
                                    validators={{ onChange: editDoctorFormSchema.shape.address }}
                                >
                                    {(field) => (
                                        <div className="space-y-1.5 md:col-span-2">
                                            <Label htmlFor={field.name}>Address</Label>
                                            <Textarea
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                placeholder="Enter address if available"
                                                onBlur={field.handleBlur}
                                                onChange={(event) => field.handleChange(event.target.value)}
                                                rows={4}
                                            />
                                            <FieldError message={getFieldErrorMessage(field) || serverFieldErrors.address} />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field
                                    name="profilePhoto"
                                    validators={{ onChange: editDoctorFormSchema.shape.profilePhoto }}
                                >
                                    {(field) => (
                                        <div className="space-y-1.5 md:col-span-2">
                                            <AppField
                                                field={field}
                                                label="Profile Photo URL"
                                                placeholder="Enter profile photo URL"
                                            />
                                            <FieldError message={serverFieldErrors.profilePhoto} />
                                        </div>
                                    )}
                                </form.Field>
                            </div>

                            <form.Field
                                name="specialties"
                                validators={{ onChange: editDoctorFormSchema.shape.specialties }}
                            >
                                {(field) => (
                                    <div className="space-y-3 rounded-lg border p-4">
                                        <div className="space-y-1">
                                            <Label>Specialties</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Select one or more specialties for this doctor.
                                            </p>
                                        </div>

                                        {isSpecialtiesLoading ? (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Loader2 className="size-4 animate-spin" />
                                                Loading specialties...
                                            </div>
                                        ) : specialties.length > 0 ? (
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {specialties.map((specialty) => {
                                                    const checked = (field.state.value || []).some(
                                                        (spec) => spec.specialtyId === specialty.id
                                                    );

                                                    return (
                                                        <div
                                                            key={specialty.id}
                                                            className="flex items-start gap-3 rounded-md border px-3 py-3 text-sm"
                                                        >
                                                            <Checkbox
                                                                checked={checked}
                                                                onCheckedChange={(isChecked) => {
                                                                    const currentSpecialties = field.state.value || [];

                                                                    if (isChecked) {
                                                                        field.handleChange([
                                                                            ...currentSpecialties,
                                                                            { specialtyId: specialty.id },
                                                                        ]);
                                                                        return;
                                                                    }

                                                                    field.handleChange(
                                                                        currentSpecialties.filter(
                                                                            (spec) => spec.specialtyId !== specialty.id,
                                                                        ),
                                                                    );
                                                                }}
                                                            />

                                                            <div className="space-y-1">
                                                                <p className="font-medium leading-none">
                                                                    {specialty.title}
                                                                </p>
                                                                {specialty.description && (
                                                                    <p className="text-muted-foreground">
                                                                        {specialty.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No specialties available right now.
                                            </p>
                                        )}

                                        <FieldError
                                            message={getFieldErrorMessage(field) || serverFieldErrors.specialties}
                                        />
                                    </div>
                                )}
                            </form.Field>
                        </div>

                        <div className="border-t px-4 py-4">
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Cancel
                                </Button>

                                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
                                    {([canSubmit, isSubmitting]) => (
                                        <AppSubmitButton
                                            isPending={isSubmitting || isPending}
                                            pendingLabel="Updating Doctor..."
                                            disabled={!canSubmit}
                                            className="w-full sm:w-auto"
                                        >
                                            Update Doctor
                                        </AppSubmitButton>
                                    )}
                                </form.Subscribe>
                            </div>
                        </div>
                    </form>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default EditDoctorSheet;
