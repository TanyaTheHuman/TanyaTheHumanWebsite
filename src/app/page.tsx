export default function Home() {
  return (
    <div className="frame">
      <header className="border-row top">
        <p className="border-text">Come back soon.</p>
      </header>
      <main className="flex-1 flex items-center justify-center px-8">
        <h1 className="main-heading text-center font-normal">
          New site
          <br />
          coming <span className="italic">soonish.</span>
        </h1>
      </main>
      <footer className="border-row bottom">
        <p className="border-text">But not too soon.</p>
      </footer>
    </div>
  );
}
