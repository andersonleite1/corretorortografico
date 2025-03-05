import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export const darkMode = "class";
export const content = ["./src/**/*.{js,ts,jsx,tsx,mdx}"];
export const theme = {
  extend: {},
};
export const plugins = [typography];
export const corePlugins = {
  //  preflight: false,
};
