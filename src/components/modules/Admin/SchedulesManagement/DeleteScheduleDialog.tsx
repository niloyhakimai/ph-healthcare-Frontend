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
import { deleteScheduleClient } from "@/services/schedule.client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

type DeleteScheduleDialogProps = {
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

const DeleteScheduleDialog = ({
    scheduleId,
    scheduleLabel,
    isOpen,
    onOpenChange,
    onConfirmDelete,
}: DeleteScheduleDialogProps) => {
    const queryClient = useQueryClient();
    const [isDeleting, setIsDeleting] = useState(false);

    const { mutateAsync } = useMutation({
        mutationFn: (id: string) => deleteScheduleClient(id),
    });

    const handleConfirm = async () => {
        if (!scheduleId) {
            toast.error("Schedule ID not found.");
            return;
        }

        setIsDeleting(true);

        try {
            const response = await mutateAsync(scheduleId);

            toast.success(response.message || "Schedule deleted successfully.");
            onOpenChange(false);
            onConfirmDelete?.();

            await queryClient.invalidateQueries({ queryKey: ["schedules"] });
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to delete schedule."));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">{scheduleLabel ?? "this schedule slot"}</span>? This action
                        cannot be undone.
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
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </AlertDialogAction>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteScheduleDialog;
