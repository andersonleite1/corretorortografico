export interface AuthContent {
  errors: {
    unexpected: string;
    identifier_not_found: string;
    password_incorrect: string;
    code_incorrect: string;
    identifier_invalid: string;
    invalid_strategy: string;
    identifier_exists: string;
    password_pwned: string;
    [key: string]: string;
  };
}
