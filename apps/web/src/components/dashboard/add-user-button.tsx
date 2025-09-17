import { getCurrentMember } from '@/features/auth/lib';
import { AddUserButtonClient } from './add-user-button-client';

export async function AddUserButton() {
  const member = await getCurrentMember();

  if (member?.role !== 'admin' && member?.role !== 'owner') {
    return null;
  }

  return <AddUserButtonClient />;
}
