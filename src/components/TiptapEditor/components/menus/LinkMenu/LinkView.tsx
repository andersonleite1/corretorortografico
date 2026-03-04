import React from "react";
import { Toolbar } from "../../ui/Toolbar";
import MenuButton from "../../MenuButton";
import useCopyToClipboard from "../../../hooks/useCopyToClipboard";
import { useTiptapContext } from "../../Provider";

interface LinkViewProps {
  url: string;
  onEdit?: () => void;
  onRemove?: () => void;
}

const LinkView = ({ url, onEdit, onRemove }: LinkViewProps) => {
  const { copy, isCopied } = useCopyToClipboard();
  const { messages } = useTiptapContext();

  return (
    <Toolbar>
      <MenuButton text={messages.link.edit} hideText={false} onClick={onEdit} />
      <MenuButton
        icon="ExternalLink"
        text={messages.link.open}
        onClick={() => window.open(url, "_blank")}
      />
      <MenuButton
        icon={isCopied ? "Check" : "Clipboard"}
        text={isCopied ? messages.link.copied : messages.link.copy}
        onClick={() => copy(url)}
      />
      <MenuButton
        icon="Unlink"
        text={messages.link.remove}
        onClick={onRemove}
      />
    </Toolbar>
  );
};

export default LinkView;
