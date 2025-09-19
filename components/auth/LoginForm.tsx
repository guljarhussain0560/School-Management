'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type Props = {
  onSuccess?: () => void;
};

export default function LoginForm({ onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for success message from registration
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      toast.success(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    console.log('🔐 Login attempt started:', { email, password: '***' });
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('🔐 SignIn result:', result);

      if (result?.error) {
        console.log('❌ SignIn error:', result.error);
        setError('Invalid email or password');
        return;
      }

      if (result?.ok) {
        console.log('✅ SignIn successful, getting session...');
        
        // Get the session to check user role
        const session = await getSession();
        console.log('🔐 Session data:', session);
        
        if (session?.user) {
          console.log('✅ User session found:', session.user);
          toast.success('Login successful!');
          
          // Redirect based on user role
          if (session.user.role === 'ADMIN') {
            console.log('🔄 Redirecting admin to /admin');
            router.push('/admin');
          } else {
            console.log('🔄 Redirecting user to /home');
            router.push('/home');
          }
          
          onSuccess?.();
        } else {
          console.log('❌ No user in session');
          setError('Session not found. Please try again.');
        }
      } else {
        console.log('❌ SignIn not successful:', result);
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.log('❌ Login error:', err);
      setError('Unable to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@school.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}


