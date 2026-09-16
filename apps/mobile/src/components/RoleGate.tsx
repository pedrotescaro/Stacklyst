import { ReactNode } from 'react';
import { useMe } from '../lib/session';
import { AsyncState, Label } from './ui';
export function RoleGate({ roles, children }: { roles: string[]; children: ReactNode }) {
  const me = useMe();
  return (
    <AsyncState query={me}>
      {me.data && roles.includes(me.data.role ?? '') ? (
        children
      ) : (
        <Label>Esta área exige uma permissão diferente na sua conta.</Label>
      )}
    </AsyncState>
  );
}
