import {NextRequest, NextResponse} from  "next/server";
import { jwtUtils } from "./lib/jwtUtils";
import { getDefaultdashboardRoute, getRouteOwner, isAuthRoute, UserRole } from "./lib/authUtils";
import { getNewTokensWithRefreshToken, getUserInfo } from "./services/auth.services";
import { isTokenExpiringSoon } from "./lib/tokenUtils";


async function refreshTokenMiddleware( refreshToken : string) : Promise<boolean> {
  try {
    const refresh = await getNewTokensWithRefreshToken(refreshToken);
    if(!refresh) {
      return false;
    }
    return true;

  } catch (error) {
    console.error("Error refreshing token is middleware:", error)
    return false;
  }
}

export async function proxy (request: NextRequest) {
   try {
     const {pathname} = request.nextUrl;
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    // const verifiedAccessToken = accessToken && await jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string);

    const decodedAccessToken = accessToken && jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string).data

    const isValidAccessToken = accessToken && jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string).success;

    let userRole: UserRole | null = null;


    if(decodedAccessToken) {
      userRole = decodedAccessToken.role as UserRole;
    }

    const routerOwner = getRouteOwner(pathname);

    const unifySuperAdminAndAdminRole = userRole === "SUPER_ADMIN" ? "ADMIN" : userRole;

    userRole = unifySuperAdminAndAdminRole;
    
    const isAuth = isAuthRoute(pathname);

    if(isValidAccessToken && refreshToken && (await isTokenExpiringSoon(accessToken))) {
      const requestHeaders = new Headers(request.headers);

      const response = NextResponse.next({
        request: {
          headers : requestHeaders
        }
      })

      try {
          const refreshed = await refreshTokenMiddleware(refreshToken);

          if(refreshed) {
            requestHeaders.set("x-token-refreshed", "1")
          }
          return NextResponse.next({
            request: {
              headers : requestHeaders
            },
            headers : response.headers
          })
      } catch (error) {
        console.error("Error refreshing token:", error)
      }
      return response;
    }


    if(isAuth && isValidAccessToken) {
      return NextResponse.redirect(new URL(getDefaultdashboardRoute(userRole as UserRole), request.url));
    }

    if(pathname === "/reset-password") {
      const email = request.nextUrl.searchParams.get("email");

      if(accessToken && email) {
        const userInfo = await getUserInfo();

        if(userInfo.needPasswordChange) {
          return NextResponse.next();
        }else {
          return NextResponse.redirect(new URL(getDefaultdashboardRoute(userRole as UserRole), request.url));
        }
      }


      if(email) {
        return NextResponse.next();
      }

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if(routerOwner === null) {
      return NextResponse.next();
    }

    if(!accessToken || !isValidAccessToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("Redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

  if(accessToken) {
    const userInfo = await getUserInfo();

    // Early Check: Jodi userInfo null hoy, tahole nicher kono kichui check korar dorkar nai
    if (!userInfo) {
        // Tumi chaile ekhane login-e redirect korte paro:
        // return NextResponse.redirect(new URL("/login", request.url));
        
        // Ba just return kore dite paro jate asha na bare
        return NextResponse.next(); 
    }

    if(userInfo.emailVerified === false) {
        if(pathname !== "/verify-email") {
            const verifyEmailUrl = new URL("/verify-email", request.url);
            verifyEmailUrl.searchParams.set("email", userInfo.email);
            return NextResponse.redirect(verifyEmailUrl);
        }
        return NextResponse.next();
    }
      
    if(userInfo.emailVerified && pathname === "/verify-email") {
        return NextResponse.redirect(new URL(getDefaultdashboardRoute(userRole as UserRole), request.url));
    }

    if(userInfo.needPasswordChange){
        if(pathname !== "/reset-password"){
            const resetPasswordUrl = new URL("/reset-password", request.url);
            resetPasswordUrl.searchParams.set("email", userInfo.email);
            return NextResponse.redirect(resetPasswordUrl);
        }
        return NextResponse.next();
    }

    if(!userInfo.needPasswordChange && pathname === "/reset-password") {
        return NextResponse.redirect(new URL(getDefaultdashboardRoute(userRole as UserRole), request.url));
    }
}

    if(routerOwner === "COMMON") {
      return NextResponse.next();
    }


    if(routerOwner === "ADMIN" || routerOwner === "DOCTOR" || routerOwner === "PATIENT") {
      if(routerOwner !== userRole) {
        return NextResponse.redirect(new URL(getDefaultdashboardRoute(userRole as UserRole), request.url));
      }
    }


    return NextResponse.next();


   } catch (error) {
      console.error("Error in proxy middleware:", error);
   }
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - .well-known (for verification files)
     */

    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|\\.well-known).*)'
  ]
}