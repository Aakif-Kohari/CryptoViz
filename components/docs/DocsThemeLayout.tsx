import Link from "next/link";
import {
  DOCS_THEME_STATS,
  buildDocsBreadcrumb,
  getDocsThemeClassNames,
  groupDocsNavigation,
} from "../../lib/docs/docsTheme";

export interface DocsThemeLayoutProps {
  pathname?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export default function DocsThemeLayout({
  pathname = "/docs",
  title,
  description,
  children,
}: DocsThemeLayoutProps) {
  const classNames = getDocsThemeClassNames();
  const breadcrumbs = buildDocsBreadcrumb(pathname);
  const sections = groupDocsNavigation();

  return (
    <main className={classNames.page}>
      <section className={classNames.shell}>
        <header className={classNames.hero}>
          <div className="relative isolate px-6 py-10 sm:px-10">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.24),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_34%)]" />

            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
            >
              {breadcrumbs.map((crumb, index) => (
                <span
                  key={`${crumb}-${index}`}
                  className="flex items-center gap-2"
                >
                  {index > 0 ? <span aria-hidden="true">/</span> : null}
                  <span
                    className={
                      index === breadcrumbs.length - 1 ? "text-cyan-200" : ""
                    }
                  >
                    {crumb}
                  </span>
                </span>
              ))}
            </nav>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Documentation
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300">
              {description}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {DOCS_THEME_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 lg:sticky lg:top-6 lg:self-start">
            <h2 className="text-xl font-black text-white">Docs navigation</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Browse guides using the same category language as the main
              website.
            </p>

            <nav
              aria-label="Documentation sections"
              className="mt-6 grid gap-5"
            >
              {sections.map((section) => (
                <div key={section.title}>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                    {section.title}
                  </p>
                  <div className="mt-3 grid gap-2">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`${classNames.focus} rounded-2xl border border-white/10 bg-slate-950/60 p-3 transition hover:border-cyan-300/40 hover:bg-cyan-300/10`}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="font-bold text-white">
                            {item.title}
                          </span>
                          {item.badge ? (
                            <span className={classNames.pill}>
                              {item.badge}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-sm leading-5 text-slate-400">
                          {item.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          <div className="grid gap-6">{children}</div>
        </section>
      </section>
    </main>
  );
}
