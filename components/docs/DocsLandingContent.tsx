import Link from "next/link";
import {
  buildDocsThemeChecklist,
  getDocsThemeClassNames,
  groupDocsNavigation,
} from "../../lib/docs/docsTheme";

export default function DocsLandingContent() {
  const classNames = getDocsThemeClassNames();
  const sections = groupDocsNavigation();
  const checklist = buildDocsThemeChecklist();

  return (
    <>
      <section className={classNames.card}>
        <p className={classNames.pill}>Design system sync</p>
        <h2 className="mt-4 text-2xl font-black text-white">
          Docs now feel like CryptoViz
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          The documentation surface uses the same dark background, gradient
          hero, rounded cards, cyan accents, and focus states used throughout
          the website. This keeps learning pages, docs, and resources visually
          consistent.
        </p>
      </section>

      <section className="grid gap-6">
        {sections.map((section) => (
          <article key={section.title} className={classNames.card}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                  {section.eyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {section.description}
                </p>
              </div>
              <p className="text-sm font-bold text-cyan-100">
                {section.items.length} links
              </p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${classNames.focus} rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-cyan-300/50 hover:bg-cyan-300/10`}
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-white">{item.title}</span>
                    {item.badge ? (
                      <span className={classNames.pill}>{item.badge}</span>
                    ) : null}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-slate-400">
                    {item.description}
                  </span>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className={classNames.card}>
        <h2 className="text-2xl font-black text-white">
          Manual verification checklist
        </h2>
        <ol className="mt-5 grid gap-3 md:grid-cols-2">
          {checklist.map((item, index) => (
            <li
              key={item}
              className="flex gap-3 text-sm leading-6 text-slate-300"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-xs font-black text-slate-950">
                {index + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
