"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { ApiErrorResponse } from "@/types/api.types";
import { ILoginResponse } from "@/types/auth.types";
import { ILoginPayload, loginZodSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";

export const loginAction = async (payload: ILoginPayload) => {
    // ১. পেলোড ভ্যালিডেশন
    const parsedPayload = loginZodSchema.safeParse(payload);
    if (!parsedPayload.success) {
        const firstError = parsedPayload.error.issues[0].message || "Invalid input";
        return {
            success: false,
            message: firstError,
        };
    }

    let isLoginSuccess = false; // রিডাইরেক্ট ট্র্যাক করার জন্য ভ্যারিয়েবল

    try {
        // ২. API কল (এটি স্বয়ংক্রিয়ভাবে http://localhost:5000/api/v1/auth/login এ যাবে)
        const response = await httpClient.post<ILoginResponse>('/auth/login', parsedPayload.data);

        // ৩. ডেটা এক্সট্র্যাক্ট করা (যদি ব্যাকএন্ড { data: { accessToken... } } পাঠায় তবে নিচেরটি ঠিক আছে)
        // নোট: যদি ব্যাকএন্ড সরাসরি { accessToken... } পাঠায়, তবে `const {accessToken} = response;` লিখতে হবে।
        const { accessToken, refreshToken, token } = (response as any).data || response; 

        // ৪. কুকিতে টোকেন সেট করা
        await setTokenInCookies("accessToken", accessToken);
        await setTokenInCookies("refreshToken", refreshToken);
        await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60);

        // লগিন সফল হয়েছে, রিডাইরেক্ট করার জন্য ফ্ল্যাগ ট্রু করে দিচ্ছি
        isLoginSuccess = true; 
        
    } catch (error: any) {
        if(error && typeof error === "object" && "digest" in error && typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT"))
        // Axios এর আসল এরর মেসেজটি বের করার চেষ্টা করছি
        // const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
        
        // console.log("Backend Error:", error.Message); // ডিবাগ করার জন্য টার্মিনালে দেখাবে
        
        return {
            success: false,
            message: `Login Failed: ${error.Message}`
        };
    }

    // ৫. Redirect সবসময় try-catch ব্লকের বাইরে রাখতে হয়! 
    if (isLoginSuccess) {
        redirect("/dashboard");
    }
};