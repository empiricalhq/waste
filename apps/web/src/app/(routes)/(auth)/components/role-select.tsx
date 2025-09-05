import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
}

export function RoleSelect({
  value,
  onValueChange,
  required,
}: RoleSelectProps) {
  return (
    <Select onValueChange={onValueChange} value={value} required={required}>
      <SelectTrigger id="role">
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
