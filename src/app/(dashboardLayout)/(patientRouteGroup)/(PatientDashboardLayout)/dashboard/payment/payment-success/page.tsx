import { redirect } from "next/navigation";

const buildQueryString = (searchParams: Record<string, string | string[] | undefined>) => {
    const nextSearchParams = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
        if (typeof value === "undefined") {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((entry) => nextSearchParams.append(key, entry));
            return;
        }

        nextSearchParams.set(key, value);
    });

    return nextSearchParams.toString();
};

export default async function PatientPaymentSuccessAliasPage(
    {
        searchParams,
    }: {
        searchParams: Promise<Record<string, string | string[] | undefined>>;
    },
) {
    const resolvedSearchParams = await searchParams;
    const queryString = buildQueryString(resolvedSearchParams);

    redirect(queryString ? `/payment/success?${queryString}` : "/payment/success");
}
