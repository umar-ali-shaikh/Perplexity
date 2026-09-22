import { FREE_MESSAGE_LIMIT } from "../constants";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    features: [
      `${FREE_MESSAGE_LIMIT} lifetime AI messages`,
      "Web search included",
      "Standard response speed",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    price: "₹299",
    period: "/month",
    highlight: true,
    features: [
      "Unlimited AI messages",
      "Faster response speed",
      "Priority web search",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹799",
    period: "/month",
    features: [
      "Everything in Plus",
      "Higher-quality AI model",
      "Priority support",
    ],
  },
];

export const PricingModal = ({ open, onClose, messagesUsed = 0 }) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pricing-modal-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl border border-white/[0.08] bg-[#1c1c1c] p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 id="pricing-modal-title" className="text-xl font-semibold text-white">
              Upgrade your plan
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              You've used {Math.min(messagesUsed, FREE_MESSAGE_LIMIT)} of{" "}
              {FREE_MESSAGE_LIMIT} free messages.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col rounded-xl border p-5 ${
                plan.highlight
                  ? "border-white/20 bg-white/[0.04]"
                  : "border-white/[0.08] bg-[#202020]"
              }`}
            >
              <p className="text-sm font-medium text-neutral-300">{plan.name}</p>

              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-white">
                  {plan.price}
                </span>
                <span className="text-xs text-neutral-500">{plan.period}</span>
              </p>

              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-[13px] leading-5 text-neutral-400"
                  >
                    <span className="mt-0.5 text-neutral-600">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={plan.id !== "free"}
                className={`mt-5 w-full rounded-lg py-2 text-sm font-medium transition ${
                  plan.id === "free"
                    ? "cursor-default bg-white/[0.06] text-neutral-500"
                    : "bg-white text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-neutral-500 disabled:hover:bg-white/[0.06]"
                }`}
              >
                {plan.id === "free" ? "Current plan" : "Coming soon"}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-5 text-center text-xs text-neutral-600">
          Paid plans aren't live yet — check back soon.
        </p>
      </div>
    </div>
  );
};
