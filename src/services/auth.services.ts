"use server";

import { setTokenInCookies } from "@/lib/tokenUtils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


if(!BASE_API_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}
export async function getNewTokensWithRefreshToken(refreshToken : string) : Promise<boolean> {
    try {
        const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                cookie : `refreshToken=${refreshToken}`
            }
        });
        if(!res.ok) {
            return false;
        }


        const {data} = await res.json();

        const {accessToken, refreshToken: newRefreshToken, token} = data;

        if(accessToken){
            await setTokenInCookies("accessToken", accessToken);
        }

        if(newRefreshToken){
            await setTokenInCookies("refreshToken", newRefreshToken)
        }

        if(token) {
            await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60);

        }
        return true;

    } catch (error) {
        console.log("Error refreshing token:", error)
        return false;
    }
}


export async function getUserInfo() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value

    if(!accessToken) {
        return null;
    }

    const res = await fetch(`${BASE_API_URL}/auth/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`
        }
    });

    if(!res.ok) {
        return null;
    }

    const {data} = await res.json();
    return data;

}

export async function logoutUser() {
    const cookieStore = await cookies();

    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    cookieStore.delete("better-auth.session_token");

    redirect("/login");
}
