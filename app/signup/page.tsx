'use client';

import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign up to start managing your school</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <SignupForm />
        </div>
        <div className="mt-3 text-center text-sm">
          Already have an account? <a href="/login" className="underline">Log in</a>
        </div>
      </div>
    </div>
  );
}


