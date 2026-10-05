import { redirect } from "next/navigation";
import { i18n, type Locale } from "../../../../i18n-config";

export default function RetiredAccountPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const home = params.locale === i18n.defaultLocale ? "/" : `/${params.locale}`;
  redirect(`${home}?legacy=account`);
}
