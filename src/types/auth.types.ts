export interface ILoginResponse {
    token: string;
    accessToken: string;
    refreshToken: string;
    user: {
        needPasswordChange: boolean;
        email: string;
        name: string;
        role: string;
        image: string;
        status: string;
        isDeleted: boolean;
        profilePhoto: string;
        emailVerified: boolean;
    }
}