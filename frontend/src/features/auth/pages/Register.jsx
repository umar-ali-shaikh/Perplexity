import { EvidenceGraph } from "../components/research/EvidenceGraph";
import { RegisterForm } from "../components/RegisterForm";
import { useRegisterForm } from "../hooks/useRegisterForm";

function Register() {
  const form = useRegisterForm();

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-ink lg:flex-row">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-20"
        style={{
          opacity: 0.035,
          mixBlendMode: "overlay",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative h-56 overflow-hidden sm:h-64 lg:h-auto lg:basis-2/3">
        <EvidenceGraph
          className="absolute inset-0"
          focusedField={form.focusedField}
          status={form.status}
        />

        <div className="pointer-events-none absolute inset-0 hidden flex-col justify-between p-12 lg:flex xl:p-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-graphite">
              Perplexity
            </p>
            <p className="mt-2 max-w-xs font-display text-lg text-paper">
              Find answers. Understand everything.
            </p>
          </div>
          <p className="max-w-xs font-mono text-xs uppercase tracking-widest text-graphite">
            Fig. 01 — Evidence spine, new session
          </p>
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto border-t border-hairline bg-ink-soft lg:flex-none lg:basis-1/3 lg:border-t-0 lg:border-l">
        <div className="flex min-h-full flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 lg:py-10">
          <RegisterForm
            values={form.values}
            errors={form.errors}
            status={form.status}
            formError={form.formError}
            showPassword={form.showPassword}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            onFocus={form.handleFocus}
            onSubmit={form.handleSubmit}
            onTogglePassword={form.toggleShowPassword}
          />
        </div>
      </div>
    </div>
  );
}

export default Register;
