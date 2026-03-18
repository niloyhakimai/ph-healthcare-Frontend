"use client";

import { deleteDoctor } from "@/services/doctor.services";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

type DeleteDoctorDialogProps = {
    doctorId: string | null;
    doctorName: string | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirmDelete?: () => void;
};

const DeleteDoctorDialog = ({
    doctorId,
    doctorName,
    isOpen,
    onOpenChange,
    onConfirmDelete,
}: DeleteDoctorDialogProps) => {
    const queryClient = useQueryClient();
    const [isDeleting, setIsDeleting] = useState(false);

    const { mutateAsync } = useMutation({
        mutationFn: (id: string) => deleteDoctor(id),
    });

    const handleConfirm = async () => {
        if (!doctorId) {
            toast.error("Doctor ID not found");
            return;
        }

        setIsDeleting(true);

        try {
            await mutateAsync(doctorId);

            toast.success("Doctor deleted successfully");

            onOpenChange(false);
            onConfirmDelete?.();

            await queryClient.invalidateQueries({ queryKey: ["doctors"] });
        } catch (error) {
            const errorMessage =
                error && typeof error === "object" && "message" in error
                    ? String(error.message)
                    : "Failed to delete doctor";

            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete <span className="font-semibold">{doctorName}</span>? This action
                        cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex gap-3 justify-end">
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

export default DeleteDoctorDialog;
