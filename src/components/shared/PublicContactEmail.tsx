type PublicContactEmailProps = {
  className?: string;
};

// These must be real HTML comments: Cloudflare reads them at the edge.
// Keep this markup constant; never interpolate user content into it.
const contactHtml =
  '<!--email_off--><a href="mailto:contato@editordetexto.online">contato@editordetexto.online</a><!--/email_off-->';

export function PublicContactEmail({ className }: PublicContactEmailProps) {
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: contactHtml }}
    />
  );
}
