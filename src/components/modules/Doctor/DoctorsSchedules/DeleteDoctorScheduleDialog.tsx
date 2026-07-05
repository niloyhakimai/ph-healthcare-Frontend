"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteMyDoctorScheduleClient } from "@/services/doctorSchedule.client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

type DeleteDoctorScheduleDialogProps = {
    scheduleId: string | null;
    scheduleLabel: string | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirmDelete?: () => void;
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        return error.message;
    }

    return fallbackMessage;
};

const DeleteDoctorScheduleDialog = ({
    scheduleId,
    scheduleLabel,
    isOpen,
    onOpenChange,
    onConfirmDelete,
}: DeleteDoctorScheduleDialogProps) => {
    const queryClient = useQueryClient();
    const [isDeleting, setIsDeleting] = useState(false);

    const { mutateAsync } = useMutation({
        mutationFn: (id: string) => deleteMyDoctorScheduleClient(id),
    });

    const handleConfirm = async () => {
        if (!scheduleId) {
            toast.error("Schedule ID not found.");
            return;
        }

        setIsDeleting(true);

        try {
            const response = await mutateAsync(scheduleId);

            toast.success(response.message || "Schedule removed successfully.");
            onOpenChange(false);
            onConfirmDelete?.();

            await queryClient.invalidateQueries({ queryKey: ["my-doctor-schedules"] });
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to remove schedule."));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remove Schedule</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to remove{" "}
                        <span className="font-semibold">{scheduleLabel ?? "this schedule slot"}</span> from your
                        schedule list?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex justify-end gap-3">
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Removing...
                            </>
                        ) : (
                            "Remove"
                        )}
                    </AlertDialogAction>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteDoctorScheduleDialog;
