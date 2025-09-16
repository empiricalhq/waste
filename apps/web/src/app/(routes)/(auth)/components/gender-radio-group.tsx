"use client";

import * as React from "react";

const options = [
  { label: 'Masculino', value: 'male' },
  { label: 'Femenino', value: 'female' },
];

export function GenderRadioGroup({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="gender"
            value={opt.value}
            checked={value === opt.value}
            onChange={(e) => onChange(e.target.value)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
          />
          <span className="text-sm font-medium">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
