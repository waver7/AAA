export default function SignInPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Sign in</h2>
      <form className="card max-w-md space-y-3">
        <input type="email" placeholder="you@example.com" className="w-full rounded border border-slate-700 bg-slate-800 p-2" />
        <button type="button" className="rounded bg-brand px-4 py-2 text-sm">Continue</button>
      </form>
    </section>
  );
}
