import { ArrowUpRight, FolderOpen } from "lucide-react";
import { type Locale } from "../../../i18n-config";
import { getAcquisitionContent } from "@/data/acquisition";
import ZerusLink from "../shared/ZerusLink";

export default function ZerusBridge({ locale }: { locale: Locale }) {
  const t = getAcquisitionContent(locale);
  return (
    <section className="zerus-bridge" aria-labelledby="zerus-bridge-title">
      <div className="zerus-bridge__icon" aria-hidden="true">
        <FolderOpen size={24} />
      </div>
      <div className="zerus-bridge__content">
        <p className="zerus-bridge__brand">Zerus</p>
        <h2 id="zerus-bridge-title">{t.title}</h2>
        <p>{t.description}</p>
        <small>{t.note}</small>
      </div>
      <ZerusLink
        locale={locale}
        placement="editor_bridge"
        className="zerus-bridge__link"
      >
        {t.cta}
        <ArrowUpRight size={16} aria-hidden="true" />
      </ZerusLink>
    </section>
  );
}
