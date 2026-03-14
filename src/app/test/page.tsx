export default function TestPage() {
  return (
    <div className="bg-cream group relative [-webkit-overflow-scrolling:touch]">
      <div className="p-6 pb-[120px]">
        <p className="text-ink mb-6 text-lg">
          Scroll down and focus the input to test the hint docking above the
          keyboard.
        </p>
        <div className="from-mustard-50 h-[150vh] bg-gradient-to-b to-transparent" />
        <label className="text-ink flex flex-col gap-2 text-base">
          <span>Type here (keyboard will open on mobile):</span>
          <input
            type="text"
            className="border-border rounded-lg border-2 bg-white px-4 py-3 font-serif text-base"
            placeholder="Focus me on mobile"
          />
        </label>
        <div className="from-mustard-50 h-[150vh] bg-gradient-to-b to-transparent" />
      </div>
      <div className="pointer-events-none inset-x-0 top-0 hidden h-svh group-focus-within:fixed group-focus-within:block">
        <div className="bg-mustard-100 text-ink absolute right-0 bottom-0 left-0 px-6 py-3 text-base">
          Hint docked to bottom of keyboard — pure CSS, no JavaScript
        </div>
      </div>
    </div>
  );
}
