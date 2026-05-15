export default function Footer() {
  return (
    <footer className="border-t border-amber-900/30 bg-stone-950/95 px-4 py-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-2 text-center text-stone-400 text-xs sm:flex-row sm:justify-between sm:text-sm">
        <span>Fan project. Data sourced from <a href="https://www.realmeye.com" target="_blank" rel="noreferrer" className="text-amber-400 hover:text-amber-300">RealmEye</a>.</span>
        <span>Not affiliated with DECA Games.</span>
      </div>
    </footer>
  );
}
