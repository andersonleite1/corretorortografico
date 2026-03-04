import { AuthContent } from "./types";

const pt: AuthContent = {
  errors: {
    unexpected: "Ocorreu um erro inesperado. Por favor, tente novamente.",
    identifier_not_found: "Não encontramos nenhuma conta com este e-mail.",
    password_incorrect: "Senha incorreta. Por favor, tente novamente.",
    code_incorrect:
      "O código inserido está incorreto. Por favor, verifique e tente novamente.",
    identifier_invalid: "O formato do e-mail é inválido.",
    invalid_strategy:
      "Esta estratégia de verificação não é válida para esta conta.",
    identifier_exists: "Este e-mail já está em uso. Tente fazer login.",
    password_pwned: "Esta senha é muito comum. Por favor, escolha outra.",
  },
};

export default pt;
