import { useTiptapContext } from "../Provider";
import MenuButton from "../MenuButton";

const EMOJIS = ["😀", "😊", "😂", "😍", "🤔", "👍", "👏", "🙏", "🎉", "🔥", "💡", "✅", "❤️", "✨", "🚀", "📚", "✍️", "💬", "⭐", "🌱"];

export default function EmojiButton() {
  const { editor } = useTiptapContext();
  return (
    <MenuButton type="popover" icon="Plus" text="Emoji" tooltip="Inserir emoji" hideText={false}>
      <div className="grid grid-cols-5 gap-1 rounded-lg bg-white p-2 shadow-xl dark:bg-zinc-800">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="rounded p-2 text-xl hover:bg-zinc-100 dark:hover:bg-zinc-700"
            onClick={() => editor.chain().focus().insertContent(emoji).run()}
            aria-label={`Inserir ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </MenuButton>
  );
}
