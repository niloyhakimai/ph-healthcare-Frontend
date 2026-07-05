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
    SheetTrigger,
} from "@/components/ui/sheet";
import { createScheduleClient } from "@/services/schedule.client";
import {
    createScheduleFormSchema,
    CreateScheduleFormValues,
    defaultCreateScheduleFormValues,
    mapCreateScheduleFormValuesToPayload,
} from "@/zod/schedule.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus } from "lucide-react";
import React, { useState } from "react";

type CreateScheduleSheetProps = {
    onSuccess?: (message: string) => void;
};

type FormFieldName = keyof CreateScheduleFormValues;
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

const CreateScheduleSheet = ({ onSuccess }: CreateScheduleSheetProps) => {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [serverFieldErrors, setServerFieldErrors] = useState<FormFieldErrors>({});

    const clearFormState = () => {
        setServerError(null);
        setServerFieldErrors({});
    };

    const form = useForm({
        defaultValues: defaultCreateScheduleFormValues,
        onSubmit: async ({ value }) => {
            clearFormState();

            const parsedValues = createScheduleFormSchema.safeParse(value);

            if (!parsedValues.success) {
                setServerError("Please review the schedule window and try again.");
                setServerFieldErrors(mapZodFieldErrors(parsedValues.error.flatten().fieldErrors));
                return;
            }

            try {
                const response = await mutateAsync(mapCreateScheduleFormValuesToPayload(parsedValues.data));
                const createdCount = Array.isArray(response.data) ? response.data.length : 0;

                form.reset();
                clearFormState();
                onSuccess?.(
                    response.message
                    || `Created ${createdCount} schedule slot${createdCount === 1 ? "" : "s"} successfully.`,
                );
                setOpen(false);

                await queryClient.invalidateQueries({ queryKey: ["schedules"] });
            } catch (error) {
                setServerError(getErrorMessage(error, "Something went wrong while creating schedules."));
            }
        },
    });

    const { mutateAsync, isPending } = useMutation({
        mutationFn: createScheduleClient,
    });

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (!nextOpen) {
            form.reset();
            clearFormState();
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <Button>
                    <CalendarPlus className="size-4" />
                    Create Schedules
                </Button>
            </SheetTrigger>

            <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                <SheetHeader className="border-b">
                    <SheetTitle>Create Schedule Window</SheetTitle>
                    <SheetDescription>
                        Generate 30-minute schedule slots for every day in the selected date range.
                    </SheetDescription>
                </SheetHeader>

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
                                name="startDate"
                                validators={{ onChange: createScheduleFormSchema.shape.startDate }}
                            >
                                {(field) => (
                                    <div className="space-y-1.5">
                                        <Label htmlFor={field.name}>Start Date</Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="date"
                                            value={field.state.value ?? ""}
                                            onBlur={field.handleBlur}
                                            onChange={(event) => field.handleChange(event.target.value)}
                                        />
                                        <FieldError
                                            message={getFieldErrorMessage(field) || serverFieldErrors.startDate}
                                        />
                                    </div>
                                )}
                            </form.Field>

                            <form.Field
                                name="endDate"
                                validators={{ onChange: createScheduleFormSchema.shape.endDate }}
                            >
                                {(field) => (
                                    <div className="space-y-1.5">
                                        <Label htmlFor={field.name}>End Date</Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="date"
                                            value={field.state.value ?? ""}
                                            onBlur={field.handleBlur}
                                            onChange={(event) => field.handleChange(event.target.value)}
                                        />
                                        <FieldError
                                            message={getFieldErrorMessage(field) || serverFieldErrors.endDate}
                                        />
                                    </div>
                                )}
                            </form.Field>

                            <form.Field
                                name="startTime"
                                validators={{ onChange: createScheduleFormSchema.shape.startTime }}
                            >
                                {(field) => (
                                    <div className="space-y-1.5">
                                        <Label htmlFor={field.name}>Daily Start Time</Label>
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
                                validators={{ onChange: createScheduleFormSchema.shape.endTime }}
                            >
                                {(field) => (
                                    <div className="space-y-1.5">
                                        <Label htmlFor={field.name}>Daily End Time</Label>
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

                        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                            Each generated schedule becomes a 30-minute slot between the selected start and end
                            times for every day in the chosen date range.
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
                                        pendingLabel="Creating Schedules..."
                                        disabled={!canSubmit}
                                        className="w-full sm:w-auto"
                                    >
                                        Create Schedules
                                    </AppSubmitButton>
                                )}
                            </form.Subscribe>
                        </div>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
};

export default CreateScheduleSheet;
