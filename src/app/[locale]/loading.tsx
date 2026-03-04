// O skeleton da página inicial agora é gerenciado diretamente pelo
// EditPageContent (loading: do dynamic import) e pelo EditForm (isLoading state).
// Este arquivo precisa existir para o Next.js, mas não renderiza nada.
import HomePageSkeleton from "@/components/shared/HomePageSkeleton";

export default function LocaleHomeLoading() {
  return <HomePageSkeleton />;
}
