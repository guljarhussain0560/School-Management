'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type Props = {
  onSuccess?: () => void;
};

export default function SignupForm({ onSuccess }: Props) {
  const [form, setForm] = useState({
    schoolName: '',
    schoolRegNo: '',
    phone: '',
    fullName: '',
    personId: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entityType, setEntityType] = useState<'school' | 'person'>('school');

  const update = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Required fields based on entity type
      if (entityType === 'school') {
        if (!form.schoolName || !form.schoolRegNo) {
          throw new Error('Please provide school name and registration number.');
        }
      } else {
        if (!form.fullName || !form.personId) {
          throw new Error('Please provide your full name and ID number.');
        }
      }

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

      // Map UI to DB fields
      const payload = {
        name: entityType === 'school' ? form.schoolName : form.fullName,
        email: form.email,
        password: form.password,
        schoolName: entityType === 'school' ? form.schoolName : undefined,
        schoolRegNo: entityType === 'school' ? form.schoolRegNo : undefined,
        phone: form.phone,
        entityType: entityType
      };

      // Call the registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const result = await response.json();
      console.log('Registration successful:', result);

      // Redirect to login page after successful registration
      window.location.href = '/login?message=Registration successful. Please log in.';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Registering as</Label>
        <RadioGroup value={entityType} onValueChange={(v) => setEntityType(v as 'school' | 'person')} className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 rounded-md border bg-white p-3">
            <RadioGroupItem value="school" id="acct-school" />
            <Label htmlFor="acct-school" className="cursor-pointer">School / Institution</Label>
          </div>
          <div className="flex items-center space-x-2 rounded-md border bg-white p-3">
            <RadioGroupItem value="person" id="acct-person" />
            <Label htmlFor="acct-person" className="cursor-pointer">Person</Label>
          </div>
        </RadioGroup>
      </div>

      {entityType === 'school' ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="schoolName">School / Institution name</Label>
            <Input
              id="schoolName"
              placeholder="Springfield High School"
              value={form.schoolName}
              onChange={update('schoolName')}
              required={entityType === 'school'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schoolRegNo">School registration number</Label>
            <Input
              id="schoolRegNo"
              placeholder="e.g., SCH-REG-2025-1234"
              value={form.schoolRegNo}
              onChange={update('schoolRegNo')}
              required={entityType === 'school'}
            />
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              placeholder="Jane Doe"
              value={form.fullName}
              onChange={update('fullName')}
              required={entityType === 'person'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="personId">ID number</Label>
            <Input
              id="personId"
              placeholder="e.g., ID-1234-5678"
              value={form.personId}
              onChange={update('personId')}
              required={entityType === 'person'}
            />
          </div>
        </>
      )}

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


