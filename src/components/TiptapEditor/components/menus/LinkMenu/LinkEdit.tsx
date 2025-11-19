import React, { useEffect, useState } from "react";

import Input from "../../ui/Input";
import Button from "../../ui/Button";
import Label from "../../ui/Label";
import { useTiptapContext } from "../../Provider";

interface LinkEditProps {
  initialUrl?: string;
  initialText?: string;
  isCreate?: boolean;
  onCancel: () => void;
  onApply: (url: string, text?: string) => void;
}

const LinkEdit = ({ initialUrl, initialText, isCreate, onApply, onCancel }: LinkEditProps) => {
  const [url, setUrl] = useState(initialUrl || "");
  const [text, setText] = useState(initialText || "");
  const [canSubmit, setCanSubmit] = useState(isCreate);
  const { messages } = useTiptapContext();

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (canSubmit) {
      onApply(url!, text);
    }
  };

  useEffect(() => {
    if (!isCreate) {
      setCanSubmit((url && url !== initialUrl) || text !== initialText);
    }
  }, [text, url]);

  return (
    <form className="rte-link__form" onSubmit={onSubmit}>
      <Label className="rte-link__label">{messages.link.urlLabel}</Label>
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="rte-link__input"
        placeholder={messages.link.urlPlaceholder}
        type="url"
        required
        autoFocus
      />

      <Label className="rte-link__label">{messages.link.textLabel}</Label>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="rte-link__input"
        placeholder={messages.link.textPlaceholder}
      />

      <div className="rte-link__actions">
        <Button variant="secondary" onClick={onCancel}>
          {messages.link.cancel}
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {messages.link.apply}
        </Button>
      </div>
    </form>
  );
};

export default LinkEdit;
