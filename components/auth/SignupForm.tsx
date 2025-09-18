'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  onSuccess?: () => void;
};

export default function SignupForm({ onSuccess }: Props) {
  const [form, setForm] = useState({
    schoolName: '',
    schoolRegNo: '',
    phone: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Frontend validation gate
      const minLength = form.password.length >= 8;
      const hasUpper = /[A-Z]/.test(form.password);
      const hasLower = /[a-z]/.test(form.password);
      const hasNumber = /\d/.test(form.password);
      const hasSpecial = /[^A-Za-z0-9]/.test(form.password);
      const passwordsMatch = form.password === form.confirmPassword;

      if (!(minLength && hasUpper && hasLower && hasNumber && hasSpecial && passwordsMatch)) {
        throw new Error('Please meet all password requirements and ensure passwords match.');
      }

      // Placeholder signup: mark as authenticated
      localStorage.setItem('isAuthenticated', 'true');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="schoolName">School name</Label>
        <Input
          id="schoolName"
          placeholder="Springfield High School"
          value={form.schoolName}
          onChange={update('schoolName')}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="schoolRegNo">School registration number</Label>
        <Input
          id="schoolRegNo"
          placeholder="e.g., SCH-REG-2025-1234"
          value={form.schoolRegNo}
          onChange={update('schoolRegNo')}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="e.g., +1 555 123 4567"
          value={form.phone}
          onChange={update('phone')}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          placeholder="Jane Doe"
          value={form.fullName}
          onChange={update('fullName')}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          type="email"
          placeholder="jane.doe@school.edu"
          value={form.email}
          onChange={update('email')}
          required
        />
      </div>
      <PasswordFields
        password={form.password}
        confirmPassword={form.confirmPassword}
        onPasswordChange={update('password')}
        onConfirmPasswordChange={update('confirmPassword')}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}

type PasswordFieldsProps = {
  password: string;
  confirmPassword: string;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function PasswordFields({ password, confirmPassword, onPasswordChange, onConfirmPasswordChange }: PasswordFieldsProps) {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="At least 8 chars, mix of cases, number, special"
          value={password}
          onChange={onPasswordChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          required
        />
      </div>
      <div className="rounded-md border bg-white p-3 text-sm">
        <p className="mb-2 font-medium">Password must include:</p>
        <ul className="space-y-1">
          <Requirement ok={minLength} label="At least 8 characters" />
          <Requirement ok={hasUpper} label="An uppercase letter (A-Z)" />
          <Requirement ok={hasLower} label="A lowercase letter (a-z)" />
          <Requirement ok={hasNumber} label="A number (0-9)" />
          <Requirement ok={hasSpecial} label="A special character (!@#$%^&* etc.)" />
          <Requirement ok={passwordsMatch} label="Passwords match" />
        </ul>
      </div>
    </div>
  );
}

function Requirement({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={ok ? 'text-green-600' : 'text-gray-500'}>
      <span className="mr-2">{ok ? '✓' : '•'}</span>
      {label}
    </li>
  );
}


