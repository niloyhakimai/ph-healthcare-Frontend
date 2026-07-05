"use client";

import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { getScheduleByIdClient, updateScheduleClient } from "@/services/schedule.client";
import {
    createEditScheduleFormValues,
    defaultEditScheduleFormValues,
    editScheduleFormSchema,
    EditScheduleFormValues,
    mapEditScheduleFormValuesToPayload,
} from "@/zod/schedule.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";

type EditScheduleSheetProps = {
    scheduleId: string | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (message: string) => void;
};

type FormFieldName = keyof EditScheduleFormValues;
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

const mapZodFieldErrors = (
    fieldErrors: Partial<Record<FormFieldName, string[] | undefined>>,
): FormFieldErrors => Object.fromEntries(
    Object.entries(fieldErrors)
        .filter(([, value]) => Array.isArray(value) && value.length > 0)
        .map(([key, value]) => [key, value?.[0] ?? "Invalid value"]),
) as FormFieldErrors;

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        return error.message;
    }

    return fallbackMessage;
};

const FieldError = ({ message }: { message?: string | null }) => {
    if (!message) {
        return null;
    }

    return <p className="text-sm text-destructive">{message}</p>;
};

const EditScheduleSheet = ({ scheduleId, isOpen, onOpenChange, onSuccess }: EditScheduleSheetProps) => {
    const queryClient = useQueryClient();
    const [serverError, setServerError] = useState<string | null>(null);
    const [serverFieldErrors, setServerFieldErrors] = useState<FormFieldErrors>({});

    const { data: scheduleResponse, isLoading } = useQuery({
        queryKey: ["schedule", scheduleId],
        queryFn: () => (scheduleId ? getScheduleByIdClient(scheduleId) : Promise.resolve(null)),
        enabled: isOpen && !!scheduleId,
    });

    const schedule = scheduleResponse?.data;

    const clearFormState = () => {
        setServerError(null);
        setServerFieldErrors({});
    };

    const form = useForm({
        defaultValues: defaultEditScheduleFormValues,
        onSubmit: async ({ value }) => {
            clearFormState();

            if (!scheduleId) {
                setServerError("Schedule not found.");
                return;
            }

            const parsedValues = editScheduleFormSchema.safeParse(value);

            if (!parsedValues.success) {
                setServerError("Please review the schedule slot and try again.");
                setServerFieldErrors(mapZodFieldErrors(parsedValues.error.flatten().fieldErrors));
                return;
            }

            try {
                const response = await mutateAsync({
                    id: scheduleId,
                    payload: mapEditScheduleFormValuesToPayload(parsedValues.data),
                });

                clearFormState();
                onSuccess?.(response.message || "Schedule updated successfully.");
                onOpenChange(false);

                await queryClient.invalidateQueries({ queryKey: ["schedules"] });
                await queryClient.invalidateQueries({ queryKey: ["schedule", scheduleId] });
            } catch (error) {
                setServerError(getErrorMessage(error, "Something went wrong while updating the schedule."));
            }
        },
    });

    const { mutateAsync, isPending } = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: ReturnType<typeof mapEditScheduleFormValuesToPayload> }) =>
            updateScheduleClient(id, payload),
    });

    React.useEffect(() => {
        if (schedule && isOpen) {
            form.reset(createEditScheduleFormValues(schedule));
            clearFormState();
        }
    }, [form, isOpen, schedule]);

    const handleOpenChange = (nextOpen: boolean) => {
        onOpenChange(nextOpen);

        if (!nextOpen) {
            clearFormState();
            form.reset();
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                <SheetHeader className="border-b">
                    <SheetTitle>Edit Schedule Slot</SheetTitle>
                    <SheetDescription>
                        Update the date and time for this individual schedule slot.
                    </SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p>Loading schedule details...</p>
                        </div>
                    </div>
                ) : !schedule ? (
                    <Alert variant="destructive" className="mt-4">
                        <AlertDescription>Failed to load schedule information.</AlertDescription>
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

                            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                                Editing this schedule changes a single slot only. It does not regenerate the
                                whole date range.
                            </div>

                            <div className="grid gap-4">
                                <form.Field
                                    name="date"
                                    validators={{ onChange: editScheduleFormSchema.shape.date }}
                                >
                                    {(field) => (
                                        <div className="space-y-1.5">
                                            <Label htmlFor={field.name}>Date</Label>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                type="date"
                                                value={field.state.value ?? ""}
                                                onBlur={field.handleBlur}
                                                onChange={(event) => field.handleChange(event.target.value)}
                                            />
                                            <FieldError
                                                message={getFieldErrorMessage(field) || serverFieldErrors.date}
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <form.Field
                                        name="startTime"
                                        validators={{ onChange: editScheduleFormSchema.shape.startTime }}
                                    >
                                        {(field) => (
                                            <div className="space-y-1.5">
                                                <Label htmlFor={field.name}>Start Time</Label>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    type="time"
                                                    value={field.state.value ?? ""}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) => field.handleChange(event.target.value)}
                                                />
                                                <FieldError
                                                    message={getFieldErrorMessage(field) || serverFieldErrors.startTime}
                                                />
                                            </div>
                                        )}
                                    </form.Field>

                                    <form.Field
                                        name="endTime"
                                        validators={{ onChange: editScheduleFormSchema.shape.endTime }}
                                    >
                                        {(field) => (
                                            <div className="space-y-1.5">
                                                <Label htmlFor={field.name}>End Time</Label>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    type="time"
                                                    value={field.state.value ?? ""}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) => field.handleChange(event.target.value)}
                                                />
                                                <FieldError
                                                    message={getFieldErrorMessage(field) || serverFieldErrors.endTime}
                                                />
                                            </div>
                                        )}
                                    </form.Field>
                                </div>
                            </div>
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
                                            pendingLabel="Updating Schedule..."
                                            disabled={!canSubmit}
                                            className="w-full sm:w-auto"
                                        >
                                            Update Schedule
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

export default EditScheduleSheet;
