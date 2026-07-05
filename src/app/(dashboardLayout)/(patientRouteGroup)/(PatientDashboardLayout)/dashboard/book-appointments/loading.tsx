import { Skeleton } from "@/components/ui/skeleton";

export default function PatientsBookAppointmentsLoading() {
    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 md:px-6">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-72 w-full rounded-3xl" />
            <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-56 w-full rounded-3xl" />
                <Skeleton className="h-56 w-full rounded-3xl" />
            </div>
        </div>
    );
}
