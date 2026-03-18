import LoginForm from '@/components/modules/auth/LoginForm';
import React from 'react'


interface LoginParams {
   searchParams: Promise<{redirect?: string}>;
}
export const LoginPage = async ({searchParams}: LoginParams) => {
  const params = await searchParams;
  const redirectPath = params.redirect;

  return (
    <LoginForm redirectPath={redirectPath}/>
  )
}

export default LoginPage;