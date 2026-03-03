export default function TestPage() {
  return (
    <div className="bg-cream relative [-webkit-overflow-scrolling:touch] group">
      <div className="p-6 pb-[120px]">
        <p className="text-lg text-ink mb-6">
          Scroll down and focus the input to test the hint docking above the keyboard.
        </p>
        <div className="h-[150vh] bg-gradient-to-b from-mustard-50 to-transparent" />
        <label className="flex flex-col gap-2 text-base text-ink">
          <span>Type here (keyboard will open on mobile):</span>
          <input
            type="text"
            className="px-4 py-3 text-base font-serif border-2 border-border rounded-lg bg-white"
            placeholder="Focus me on mobile"
          />
        </label>
        <div className="h-[150vh] bg-gradient-to-b from-mustard-50 to-transparent" />
      </div>
      <div className="hidden group-focus-within:fixed group-focus-within:block h-svh top-0 inset-x-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 py-3 px-6 bg-mustard-100 text-base text-ink">
          Hint docked to bottom of keyboard — pure CSS, no JavaScript
        </div>
      </div>
    </div>
  );
}
