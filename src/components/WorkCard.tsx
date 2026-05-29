type WorkCardProps = {
  title: string;
};

/** Visual card surface only; hover motion lives on the parent <li>. */
export function WorkCard({ title }: WorkCardProps) {
  return (
    <article
      aria-label={title}
      className="border-stone-400 bg-cream aspect-[4/3] w-full border shadow-none"
    />
  );
}
