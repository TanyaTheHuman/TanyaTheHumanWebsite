import Link from "next/link";

/** Work page title block — Figma node 2294:10999 */
export function WorkPageHeader() {
  return (
    <header className="flex flex-col items-start gap-6">
      <Link
        href="/"
        className="body-default-bold text-ink focus:ring-mustard-300 focus:ring-offset-cream border border-stone-500 px-3 py-1.5 font-bold [font-feature-settings:'dlig'_on] hover:border-stone-400 hover:bg-stone-300 hover:text-stone-700 focus:ring-1 focus:ring-offset-2 focus:outline-none"
      >
        Home
      </Link>

      <div className="flex flex-col items-start gap-4">
        <h1 className="h3 text-stone-800 [font-feature-settings:'swsh'_1]">
          <span className="h3-italic">Some</span>
          <span> things</span>
        </h1>

        <p className="body-large max-w-[42rem] text-stone-800">
          A small collection of work and personal projects.
        </p>
      </div>
    </header>
  );
}
