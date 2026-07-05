import { Skeleton } from "@/components/ui/skeleton";

export default function PatientsMyAppointmentsLoading() {
    return (
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 md:px-6">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <Skeleton className="h-44 w-full rounded-3xl" />
            <Skeleton className="h-44 w-full rounded-3xl" />
        </div>
    );
}
