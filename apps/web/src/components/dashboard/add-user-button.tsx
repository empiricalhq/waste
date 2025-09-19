import { getCurrentMember } from '@/features/auth/lib';
import { AddUserDialog } from './add-user-dialog';

export async function AddUserButton() {
  const member = await getCurrentMember();

  if (member?.role !== 'admin' && member?.role !== 'owner') {
    return null;
  }

  return <AddUserDialog />;
}
