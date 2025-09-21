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
        <Label htmlFor="name" className="mb-2 text-white font-medium">
          Name
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter your name"
          defaultValue={state.name || nameValue}
          required
          className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400 focus:ring-[#009AFF] focus:border-[#009AFF]"
        />
      </div>
      <div>
        <Label htmlFor="email" className="mb-2 text-white font-medium">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          defaultValue={emailValue}
          required
          className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400 focus:ring-[#009AFF] focus:border-[#009AFF]"
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
    <section className="flex-1 p-4 lg:p-8 bg-black">
      <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-[var(--font-display)] mb-8">
        General Settings
      </h1>

      <Card className="bg-gradient-to-br from-neutral-900 to-black border-2 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-white text-xl font-[var(--font-display)]">Account Information</CardTitle>
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
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#009AFF] px-6 py-3 text-white text-sm font-semibold hover:bg-[#009AFF]/90 transition-all duration-200 shadow-[0_0_0_6px_rgba(0,154,255,0.12)] hover:shadow-[0_0_0_8px_rgba(0,154,255,0.18)] disabled:opacity-50 disabled:cursor-not-allowed"
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