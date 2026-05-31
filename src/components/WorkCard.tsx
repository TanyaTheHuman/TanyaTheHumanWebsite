type WorkCardProps = {
  label: string;
  /** Tailwind class for subtle background tint (e.g. "bg-stone-50"). */
  toneClassName?: string;
};

/** Visual card surface only; hover motion lives on the parent <li>. */
export function WorkCard({ label, toneClassName = "bg-cream" }: WorkCardProps) {
  return (
    <article
      aria-label={label}
      className={`border-stone-400 aspect-[4/3] w-full border shadow-none ${toneClassName}`}
    />
  );
}
