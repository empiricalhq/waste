import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const options = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

export function GenderRadioGroup({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className="grid grid-cols-3 gap-4"
    >
      {options.map((opt) => (
        <div
          key={opt.value}
          className={cn(
            "mt-2 flex items-center space-x-2 rounded-lg px-4 py-2 ring transition-all duration-300",
            value === opt.value
              ? "ring-primary/10 bg-muted text-foreground"
              : "ring-muted hover:bg-muted text-muted-foreground",
          )}
        >
          <RadioGroupItem
            value={opt.value}
            id={opt.value}
            className="peer sr-only"
          />
          <Label
            htmlFor={opt.value}
            className="mx-auto flex w-full cursor-pointer items-center justify-center text-sm font-medium transition-all duration-300"
          >
            {opt.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
