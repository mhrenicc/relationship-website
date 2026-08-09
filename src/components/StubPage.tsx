import { Nav } from "@/components/Nav";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

export function StubPage({ eyebrow, title, description }: Props) {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Nav />
      <main className="flex flex-1 flex-col items-start justify-center gap-4 px-6 py-[var(--space-section)] sm:px-10">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--color-gold)]">
          {eyebrow}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-[var(--text-display)] text-[var(--color-ink)]">
          {title}
        </h1>
        <p className="max-w-md text-[var(--text-base)] text-[var(--color-ink-soft)]">
          {description}
        </p>
      </main>
    </div>
  );
}
