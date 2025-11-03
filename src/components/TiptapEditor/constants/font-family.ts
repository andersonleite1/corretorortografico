export interface FontFamilyOption {
  label: string;
  value: string;
}

export const FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
  {
    label: "Fonte padrão",
    value: "",
  },
  {
    label: "Open Sans",
    value: "'Open Sans', sans-serif",
  },
  {
    label: "JetBrains Mono",
    value: "'JetBrains Mono', monospace",
  },
  {
    label: "Georgia",
    value: "Georgia, serif",
  },
  {
    label: "Times New Roman",
    value: "'Times New Roman', serif",
  },
  {
    label: "Courier New",
    value: "'Courier New', monospace",
  },
  {
    label: "Arial",
    value: "Arial, sans-serif",
  },
];
