'use client';

import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Login to your School Management Portal</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
        <div className="mt-3 text-center text-sm">
          New here? <a href="/signup" className="underline">Create an account</a>
        </div>
      </div>
    </div>
  );
}


