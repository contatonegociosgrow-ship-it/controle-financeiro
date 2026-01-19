'use client';

import { COLOR_PALETTE } from '@/lib/categoryColors';

type ColorPickerProps = {
  selectedColor?: string;
  onColorChange: (color: string) => void;
};

export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-semibold uppercase tracking-wide">
        Cor da Categoria
      </label>
      <div className="flex flex-wrap gap-2">
        {COLOR_PALETTE.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorChange(color)}
            className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
              selectedColor === color
                ? 'border-gray-900 dark:border-white shadow-lg ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={selectedColor || '#6b7280'}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
            title="Escolher cor personalizada"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">Personalizada</span>
        </div>
      </div>
    </div>
  );
}
