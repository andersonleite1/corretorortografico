import EditPageContent from "./EditPageContent";
import { buildHomeMetadata, getHomeContent } from "@/data/home";
import { i18n } from "../../../i18n-config";

const defaultLocale = i18n.defaultLocale;

export const metadata = buildHomeMetadata(defaultLocale);

export default function HomePage() {
  const content = getHomeContent(defaultLocale);
  return <EditPageContent content={content} />;
}
