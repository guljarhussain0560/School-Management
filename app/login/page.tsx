'use client';

import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();

  const handleAuthSuccess = () => {
    router.replace('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Login to your School Management Portal</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <LoginForm onSuccess={handleAuthSuccess} />
        </div>
        <div className="mt-3 text-center text-sm">
          New here? <a href="/signup" className="underline">Create an account</a>
        </div>
        <div className="mt-4 flex gap-2">
          <a href="/home" className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-center text-sm hover:bg-gray-200">Dashboard</a>
          <a href="/input-portal" className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-center text-sm hover:bg-gray-200">Input Portal</a>
        </div>
      </div>
    </div>
  );
}


