export type LanguageToolReplacement = {
  value: string;
};

export type LanguageToolRule = {
  id: string;
  description: string;
  issueType?: string;
  category?: {
    id: string;
    name: string;
  };
};

export type LanguageToolMatch = {
  message: string;
  shortMessage?: string;
  replacements: LanguageToolReplacement[];
  offset: number;
  length: number;
  sentence?: string;
  context?: {
    text: string;
    offset: number;
    length: number;
  };
  rule?: LanguageToolRule;
  type?: {
    typeName: string;
  };
};

export type LanguageToolResponse = {
  matches: LanguageToolMatch[];
  language?: {
    name: string;
    code: string;
  };
};

export type LanguageToolIssue = {
  id: string;
  from: number;
  to: number;
  message: string;
  replacements: string[];
  ruleId?: string;
  ruleDescription?: string;
  typeName?: string;
  sentence?: string;
  issueType?: string;
};
