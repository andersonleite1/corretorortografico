const skeletonBase =
  "animate-pulse bg-slate-200/80 dark:bg-slate-800/60 shadow-inner";

type SkeletonProps = {
  className?: string;
};

const mergeClasses = (...classes: Array<string | undefined | null | false>) =>
  classes.filter(Boolean).join(" ");

const SkeletonLine = ({ className }: SkeletonProps) => (
  <div
    className={mergeClasses(
      skeletonBase,
      "rounded-full",
      className ?? "h-4 w-full",
    )}
    aria-hidden="true"
  />
);

const SkeletonBlock = ({ className }: SkeletonProps) => (
  <div
    className={mergeClasses(
      skeletonBase,
      "rounded-[2rem]",
      className ?? "h-32 w-full",
    )}
    aria-hidden="true"
  />
);

const SkeletonParagraph = ({
  rows = 3,
  className,
}: SkeletonProps & { rows?: number }) => (
  <div className={mergeClasses("space-y-3", className)}>
    {Array.from({ length: rows }).map((_, index) => (
      <SkeletonLine
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className={mergeClasses(index === rows - 1 ? "w-5/6" : "w-full", "h-4")}
      />
    ))}
  </div>
);

const MobileCarouselSkeleton = () => (
  <div className="w-full xl:hidden">
    <SkeletonBlock className="h-48 rounded-[2.5rem]" />
  </div>
);

const EditorSkeleton = () => (
  <div className="w-full rounded-[2.5rem] border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
    <div className="space-y-4">
      <SkeletonLine className="h-6 w-1/5" />
      <div className="flex flex-col gap-3 sm:flex-row">
        <SkeletonLine className="h-12 flex-1" />
        <SkeletonLine className="h-12 w-full sm:w-56" />
      </div>
      <SkeletonBlock className="h-80 rounded-[1.5rem]" />
      <div className="grid gap-3 sm:grid-cols-2">
        <SkeletonLine className="h-11 rounded-full" />
        <SkeletonLine className="h-11 rounded-full" />
        <SkeletonLine className="h-11 rounded-full sm:col-span-2" />
      </div>
    </div>
  </div>
);

const ArticleSkeleton = () => (
  <section className="w-full rounded-[2.5rem] border border-slate-200 bg-white/90 px-4 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:px-6 md:px-10">
    <div className="space-y-6">
      <SkeletonLine className="h-8 w-1/2" />
      <SkeletonParagraph rows={4} />
      <SkeletonLine className="h-6 w-1/3" />
      <SkeletonParagraph rows={5} />
      <SkeletonLine className="h-6 w-2/5" />
      <SkeletonParagraph rows={4} />
    </div>
  </section>
);

const FaqSkeleton = () => (
  <section className="w-full rounded-[2.5rem] border border-slate-200 bg-white/90 px-4 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:px-6 md:px-12">
    <div className="space-y-3 text-center md:text-left">
      <SkeletonLine className="h-3 w-24" />
      <SkeletonLine className="h-7 w-2/3" />
      <SkeletonLine className="h-4 w-3/4" />
    </div>
    <div className="mt-8 space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="rounded-3xl border border-slate-100 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/70"
        >
          <SkeletonLine className="h-5 w-5/6" />
          <SkeletonLine className="mt-3 h-4 w-2/3" />
        </div>
      ))}
    </div>
  </section>
);

const SidebarSkeleton = () => (
  <aside className="hidden w-full max-w-xs flex-shrink-0 xl:block">
    <div className="sticky top-6 mt-10 flex flex-col gap-4">
      <SkeletonBlock className="h-32 rounded-[2rem]" />
    </div>
  </aside>
);

export default function HomePageSkeleton() {
  return (
    <div className="px-3 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 xl:flex-row">
        <div className="flex w-full justify-center">
          <div className="flex w-full max-w-[56rem] flex-col items-center gap-6">
            <EditorSkeleton />
            <MobileCarouselSkeleton />
            <ArticleSkeleton />
            <MobileCarouselSkeleton />
            <FaqSkeleton />
          </div>
        </div>
        <SidebarSkeleton />
      </div>
    </div>
  );
}
