export function LoadingScreen() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-6 bg-ink px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-graphite">
        Perplexity
      </p>

      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-1.5"
      >
        <span className="sr-only">Loading</span>
        <span className="h-2 w-2 animate-bounce rounded-full bg-evidence motion-reduce:animate-none [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-evidence motion-reduce:animate-none [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-evidence motion-reduce:animate-none" />
      </div>

      <p className="font-display text-lg text-paper">
        Reconnecting your evidence&hellip;
      </p>
    </div>
  );
}
