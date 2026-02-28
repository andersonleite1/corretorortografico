import React from "react";
import NextScript from "next/script";

interface LoadScriptProps {
  src: string;
  onLoad?: () => void;
  onError?: () => void;
}

const Script = ({ src, onError, onLoad }: LoadScriptProps) => {
  return (
    <NextScript
      src={src}
      onLoad={onLoad}
      onError={onError}
      strategy="afterInteractive"
    />
  );
};

export default Script;
