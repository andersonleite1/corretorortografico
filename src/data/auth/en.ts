import { AuthContent } from "./types";

const en: AuthContent = {
    errors: {
        unexpected: "An unexpected error occurred. Please try again.",
        identifier_not_found: "We couldn't find any account with this email.",
        password_incorrect: "Incorrect password. Please try again.",
        code_incorrect: "The code entered is incorrect. Please check and try again.",
        identifier_invalid: "The email format is invalid.",
        invalid_strategy: "The verification strategy is not valid for this account.",
        identifier_exists: "This email is already in use. Try logging in.",
        password_pwned: "This password is too common. Please choose another one.",
    },
};

export default en;
