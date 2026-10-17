import { useId } from 'react';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';

type NumberFieldProps = {
  label: string;
  description?: string;
  unit?: string;
  value: string;
  min?: number;
  max?: number;
  invalid?: boolean;
  onValueChange: (value: string) => void;
};

export function NumberField({
  label,
  description,
  unit,
  value,
  min,
  max,
  invalid = false,
  onValueChange,
}: NumberFieldProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <InputGroup>
        <InputGroupInput
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          value={value}
          aria-invalid={invalid}
          onChange={(event) => onValueChange(event.target.value)}
        />
        {unit && (
          <InputGroupAddon align="inline-end">
            <InputGroupText>{unit}</InputGroupText>
          </InputGroupAddon>
        )}
      </InputGroup>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
