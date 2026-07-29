import { REAL_WORLD_USES } from "../../lib/cipher/realWorldUses";

interface Props {
  cipherId: string;
}

export default function WhereIsThisUsed({ cipherId }: Props) {
  const uses = REAL_WORLD_USES[cipherId];

  if (!uses || uses.length === 0) return null;

  return (
    <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="mb-5 text-2xl font-bold">
        Where Is This Used?
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {uses.map((group) => (
          <div
            key={group.title}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
          >
            <h3 className="mb-3 text-lg font-semibold">
              {group.title}
            </h3>

            <ul className="space-y-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm"
                >
                  <span>✔</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}