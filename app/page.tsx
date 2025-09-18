'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      router.replace('/home');
    }
  }, [router]);

  const handleAuthSuccess = () => {
    router.replace('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">School Management Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Login or create your school workspace</p>
        </div>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-4">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <LoginForm onSuccess={handleAuthSuccess} />
            </div>
          </TabsContent>
          <TabsContent value="signup" className="mt-4">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <SignupForm onSuccess={handleAuthSuccess} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}