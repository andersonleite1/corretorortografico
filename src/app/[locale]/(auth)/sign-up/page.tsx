import { redirect } from "next/navigation";
import { type Locale } from "../../../../../i18n-config";
import { getZerusHref } from "@/lib/zerus";

export default function RetiredAuthPage({
  params,
}: {
  params: { locale: Locale };
}) {
  redirect(getZerusHref(params.locale, "legacy_auth"));
}
