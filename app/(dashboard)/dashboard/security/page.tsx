// Replaced orange brand colors with theme variables.
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, Trash2, Loader2 } from 'lucide-react';
import { useActionState } from 'react';
import { updatePassword, deleteAccount } from '@/app/(login)/actions';

type PasswordState = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  error?: string;
  success?: string;
};

type DeleteState = {
  password?: string;
  error?: string;
  success?: string;
};

export default function SecurityPage() {
  const [passwordState, passwordAction, isPasswordPending] = useActionState<
    PasswordState,
    FormData
  >(updatePassword, {});

  const [deleteState, deleteAction, isDeletePending] = useActionState<
    DeleteState,
    FormData
  >(deleteAccount, {});

  return (
    <section className="flex-1 p-4 bg-black">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white mb-1">Security Settings</h1>
        <p className="text-neutral-400 text-sm">Manage your password and account security</p>
      </div>
      <Card className="mb-4 bg-neutral-900 border border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white">Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" action={passwordAction}>
            <div>
              <Label htmlFor="current-password" className="mb-2 text-neutral-300 font-medium">
                Current Password
              </Label>
              <Input
                id="current-password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.currentPassword}
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400 focus:ring-2 focus:ring-neutral-500/50 focus:border-neutral-500"
              />
            </div>
            <div>
              <Label htmlFor="new-password" className="mb-2 text-neutral-300 font-medium">
                New Password
              </Label>
              <Input
                id="new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.newPassword}
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400 focus:ring-2 focus:ring-neutral-500/50 focus:border-neutral-500"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password" className="mb-2 text-neutral-300 font-medium">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.confirmPassword}
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400 focus:ring-2 focus:ring-neutral-500/50 focus:border-neutral-500"
              />
            </div>
            {passwordState.error && (
              <p className="text-red-400 text-sm">{passwordState.error}</p>
            )}
            {passwordState.success && (
              <p className="text-green-400 text-sm">{passwordState.success}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-neutral-700 hover:bg-neutral-600 text-white"
              disabled={isPasswordPending}
            >
              {isPasswordPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-neutral-900 border border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white">Delete Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-400 mb-4">
            Account deletion is non-reversable. Please proceed with caution.
          </p>
          <form action={deleteAction} className="space-y-4">
            <div>
              <Label htmlFor="delete-password" className="mb-2 text-neutral-300 font-medium">
                Confirm Password
              </Label>
              <Input
                id="delete-password"
                name="password"
                type="password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={deleteState.password}
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400 focus:ring-2 focus:ring-neutral-500/50 focus:border-neutral-500"
              />
            </div>
            {deleteState.error && (
              <p className="text-red-400 text-sm">{deleteState.error}</p>
            )}
            <Button
              type="submit"
              variant="destructive"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-white text-sm font-semibold hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isDeletePending}
            >
              {isDeletePending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}