import { Link } from "react-router";

const labelClasses = "font-mono text-xs uppercase tracking-widest text-graphite";

const linkButtonClasses =
  "min-h-11 text-sm text-graphite underline-offset-4 hover:text-paper hover:underline " +
  "focus-visible:text-paper focus-visible:outline focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-evidence";

const fieldClasses =
  "w-full border-b border-hairline bg-transparent py-3 text-base text-paper outline-none " +
  "transition-colors focus-visible:border-evidence disabled:opacity-50";

export function RegisterForm({
  values,
  errors,
  status,
  formError,
  showPassword,
  onChange,
  onBlur,
  onFocus,
  onSubmit,
  onTogglePassword,
}) {
  const isSubmitting = status === "submitting";
  const isSuccess = status === "success";

  return (
    <div className="w-full max-w-sm">
      <p className={`research-reveal ${labelClasses}`}>New case file</p>

      <h1
        className="research-reveal mt-3 font-display text-3xl leading-tight text-paper sm:text-4xl"
        style={{ animationDelay: "70ms" }}
      >
        Open an investigation.
      </h1>

      <p
        className="research-reveal mt-3 text-sm text-graphite"
        style={{ animationDelay: "140ms" }}
      >
        Create an account to start gathering sources, threads, and evidence.
      </p>

      <form
        className="research-reveal mt-8 flex flex-col gap-6"
        style={{ animationDelay: "210ms" }}
        onSubmit={onSubmit}
        noValidate
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="register-username" className={labelClasses}>
            Name
          </label>
          <input
            id="register-username"
            name="username"
            type="text"
            autoComplete="name"
            value={values.username}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.username)}
            aria-describedby={
              errors.username ? "register-username-error" : undefined
            }
            className={fieldClasses}
          />
          {errors.username ? (
            <p id="register-username-error" className="text-sm text-alert">
              {errors.username}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="register-email" className={labelClasses}>
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "register-email-error" : undefined}
            className={fieldClasses}
          />
          {errors.email ? (
            <p id="register-email-error" className="text-sm text-alert">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor="register-password" className={labelClasses}>
              Password
            </label>
            <button
              type="button"
              onClick={onTogglePassword}
              aria-pressed={showPassword}
              className={linkButtonClasses}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <input
            id="register-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={values.password}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "register-password-error" : undefined
            }
            className={fieldClasses}
          />
          {errors.password ? (
            <p id="register-password-error" className="text-sm text-alert">
              {errors.password}
            </p>
          ) : (
            <p className="text-sm text-graphite">
              At least 6 characters, with an uppercase letter, a lowercase
              letter, and a number.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 bg-paper py-3 font-mono text-sm uppercase tracking-widest text-ink transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-evidence disabled:opacity-60"
        >
          {isSubmitting ? "Opening file…" : "Create account"}
        </button>

        <p role="status" aria-live="polite" className="min-h-5 text-sm">
          {formError ? (
            <span className="text-alert">{formError}</span>
          ) : isSuccess ? (
            <span className="text-evidence">
              Case file opened. Check your email to verify your account
              before signing in.
            </span>
          ) : null}
        </p>
      </form>

      <p
        className="research-reveal mt-6 text-sm text-graphite"
        style={{ animationDelay: "280ms" }}
      >
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-paper underline-offset-4 hover:underline focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-evidence"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
