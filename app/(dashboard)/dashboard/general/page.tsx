// Replaced orange brand colors with theme variables.
'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { updateAccount } from '@/app/(login)/actions';
import { User } from '@/lib/db/schema';
import useSWR from 'swr';
import { Suspense } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ActionState = {
  name?: string;
  error?: string;
  success?: string;
};

type AccountFormProps = {
  state: ActionState;
  nameValue?: string;
  emailValue?: string;
};

function AccountForm({
  state,
  nameValue = '',
  emailValue = ''
}: AccountFormProps) {
  return (
    <>
      <div>
        <Label htmlFor="name" className="mb-2 text-slate-300 font-medium">
          Name
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter your name"
          defaultValue={state.name || nameValue}
          required
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
        />
      </div>
      <div>
        <Label htmlFor="email" className="mb-2 text-slate-300 font-medium">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          defaultValue={emailValue}
          required
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
        />
      </div>
    </>
  );
}

function AccountFormWithData({ state }: { state: ActionState }) {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  return (
    <AccountForm
      state={state}
      nameValue={user?.name ?? ''}
      emailValue={user?.email ?? ''}
    />
  );
}

export default function GeneralPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateAccount,
    {}
  );

  return (
    <section className="flex-1 p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">General Settings</h1>
        <p className="text-slate-300">Manage your account information</p>
      </div>

      <Card className="bg-slate-800 border border-slate-700 shadow-lg shadow-blue-500/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" action={formAction}>
            <Suspense fallback={<AccountForm state={state} />}>
              <AccountFormWithData state={state} />
            </Suspense>
            {state.error && (
              <p className="text-red-400 text-sm">{state.error}</p>
            )}
            {state.success && (
              <p className="text-green-400 text-sm">{state.success}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-200"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}