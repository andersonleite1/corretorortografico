import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-8 mt-8">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-lg">
          Feito com <span className="text-red-500">💚</span> por{" "}
          <strong>editordetexto.online</strong>
        </p>
        <p className="text-sm mt-2 text-gray-400">
          &copy; {currentYear} Editor de Texto Online. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
