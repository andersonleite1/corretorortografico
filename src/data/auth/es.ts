import { AuthContent } from "./types";

const es: AuthContent = {
  errors: {
    unexpected: "Ocurreu un error inesperado. Por favor, intente de nuevo.",
    identifier_not_found:
      "No encontramos ninguna cuenta con este correo electrónico.",
    password_incorrect: "Contraseña incorrecta. Por favor, intente de nuevo.",
    code_incorrect:
      "El código ingresado es incorrecto. Por favor, verifíquelo e intente de nuevo.",
    identifier_invalid: "El formato del correo electrónico no es válido.",
    invalid_strategy:
      "La estrategia de verificación no es válida para esta cuenta.",
    identifier_exists:
      "Este correo electrónico ya está en uso. Intente iniciar sesión.",
    password_pwned:
      "Esta contraseña es demasiado común. Por favor, elija otra.",
  },
};

export default es;
