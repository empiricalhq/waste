import { useId } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RoleSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export function RoleSelect({ value, onChange, disabled, required }: RoleSelectProps) {
  const id = useId();

  return (
    <Select onValueChange={onChange} value={value} required={required} disabled={disabled}>
      <SelectTrigger id={id}>
        <SelectValue placeholder="Seleccionar un rol" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="supervisor">Supervisor</SelectItem>
        <SelectItem value="driver">Chofer</SelectItem>
      </SelectContent>
    </Select>
  );
}
