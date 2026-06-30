'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, User as UserIcon, Lock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide an email address.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await signIn('mock-developer', {
        email,
        name: name || undefined,
        role,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-primary-violet/10 via-primary-lavender/20 to-primary-blush/20 p-4 font-sans relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] h-[300px] w-[300px] rounded-full bg-primary-violet/10 blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[300px] w-[300px] rounded-full bg-primary-blush/20 blur-[80px]" />

      <Card className="max-w-md w-full glass border-white/40 shadow-xl relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary-lavender flex items-center justify-center text-primary-violet mb-3">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold font-display text-text-primary">Welcome to SheNova AI</CardTitle>
          <CardDescription className="text-text-secondary text-sm">
            Empowering Women. Secure. AI-Driven.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 text-xs bg-state-error/10 border border-state-error/20 text-state-error rounded-lg text-center font-semibold">
              {error}
            </div>
          )}

          {/* Mock Developer Form */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary-violet" />
              Developer Environment Access
            </h3>
            
            <Input
              label="Email Address"
              type="email"
              placeholder="developer@shenova.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              disabled={isLoading}
              required
            />

            <Input
              label="Display Name"
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<UserIcon className="h-4 w-4" />}
              disabled={isLoading}
            />

            <div>
              <label className="text-xs font-semibold text-text-secondary font-inter tracking-wide uppercase block mb-1.5">
                Target Auth Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all duration-200
                    ${role === 'USER'
                      ? 'border-primary-violet bg-primary-lavender/30 text-primary-violet font-bold'
                      : 'border-bg-border bg-white text-text-secondary hover:bg-bg-surface'
                    }
                  `}
                >
                  Regular User
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all duration-200
                    ${role === 'ADMIN'
                      ? 'border-primary-violet bg-primary-lavender/30 text-primary-violet font-bold'
                      : 'border-bg-border bg-white text-text-secondary hover:bg-bg-surface'
                    }
                  `}
                >
                  Administrator
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In with Mock Account
            </Button>
          </form>

          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-bg-border"></div>
            </div>
            <span className="relative px-3 bg-white text-xs text-text-secondary uppercase font-semibold">Or</span>
          </div>

          {/* Social Provider */}
          <Button
            type="button"
            variant="secondary"
            onClick={handleGoogleSignIn}
            className="w-full flex justify-center items-center gap-2"
            disabled={isLoading}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
