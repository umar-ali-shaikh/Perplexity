import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../../auth/hooks/useAuth";
import { MessageThread } from "../components/MessageThread";
import { PricingModal } from "../components/PricingModal";
import { FREE_MESSAGE_LIMIT } from "../constants";

const Dashboard = () => {
  const chat = useChat();
  const { handleLogout } = useAuth();
  const { user } = useSelector((state) => state.auth);

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const profileMenuRef = useRef(null);

  const messagesUsed = user?.messageCount ?? 0;
  const limitReached = messagesUsed >= FREE_MESSAGE_LIMIT;

  useEffect(() => {
    chat.initializedSocketConnection();
    chat.getChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuOpen]);

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed || limitReached) return;

    chat.sendMessage(trimmed);
    setQuery("");
  };

  const trendingTopics = [
    {
      title: "AI Agents",
      description: "Latest developments in autonomous AI systems",
      icon: "✦",
    },
    {
      title: "Software Engineering",
      description: "Modern architecture, tools and best practices",
      icon: "⌘",
    },
    {
      title: "Technology",
      description: "Explore what's happening in tech",
      icon: "◉",
    },
  ];

  return (
    <main className="min-h-screen w-full bg-[#191919] text-white">
      {/* ================= HEADER ================= */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/[0.06] bg-[#191919]/90 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
                <span className="text-sm font-bold">P</span>
              </div>

              <span className="hidden text-lg font-semibold tracking-tight sm:block">
                Perplexity
              </span>
            </div>
          </div>

          {/* Center */}
          <div className="hidden items-center gap-1 rounded-xl bg-white/[0.04] p-1 md:flex">
            {["All", "Academic", "Social", "Finance"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-1.5 text-sm transition ${
                  activeTab === tab
                    ? "bg-white/[0.09] text-white"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPricing(true)}
              className="hidden rounded-lg px-3 py-2 text-sm text-neutral-400 transition hover:bg-white/[0.06] hover:text-white sm:block"
            >
              Upgrade
            </button>
          </div>
        </div>
      </header>

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed bottom-0 left-0 top-16 z-40 w-[270px] border-r border-white/[0.06] bg-[#191919] transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-3">
          {/* New Thread */}
          <button
            onClick={() => chat.startNewChat()}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200"
          >
            <span className="text-lg leading-none">+</span>
            New Thread
          </button>

          {/* Navigation */}
          <nav className="space-y-1">
            <SidebarItem icon="⌕" label="Home" active />
            <SidebarItem icon="◎" label="Discover" />
            <SidebarItem icon="▣" label="Library" />
          </nav>

          <div className="my-5 h-px bg-white/[0.06]" />

          {/* Recent */}
          <div className="mb-2 px-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-600">
              Recent
            </span>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto">
            {chat.chats.length === 0 && (
              <p className="px-2 text-[13px] text-neutral-600">
                No recent threads yet
              </p>
            )}

            {chat.chats.map((c) => (
              <div
                key={c._id}
                className={`group relative flex w-full items-start gap-2 rounded-lg pl-2 pr-8 py-2 transition hover:bg-white/[0.05] ${
                  chat.currentChatId === c._id ? "bg-white/[0.06]" : ""
                }`}
              >
                <button
                  onClick={() => chat.getMessages(c._id)}
                  className="flex flex-1 items-start gap-2 text-left"
                >
                  <span className="mt-0.5 text-xs text-neutral-600">◦</span>

                  <span className="line-clamp-2 text-[13px] leading-5 text-neutral-400 group-hover:text-neutral-200">
                    {c.title}
                  </span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    chat.deleteChat(c._id);
                  }}
                  title="Delete thread"
                  aria-label={`Delete thread: ${c.title}`}
                  className="absolute right-1 top-1.5 hidden h-6 w-6 items-center justify-center rounded-md text-neutral-500 transition hover:bg-white/[0.08] hover:text-red-400 group-hover:flex"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="border-t border-white/[0.06] pt-3">
            <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-neutral-500 transition hover:bg-white/[0.05] hover:text-white">
              <span>⚙</span>
              Settings
            </button>

            <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-neutral-500 transition hover:bg-white/[0.05] hover:text-white">
              <span>?</span>
              Help
            </button>

            <div ref={profileMenuRef} className="relative mt-1">
              {profileMenuOpen && (
                <div className="absolute bottom-full left-0 mb-1 w-full overflow-hidden rounded-lg border border-white/[0.08] bg-[#232323] py-1 shadow-xl">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-300 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <span>⇄</span>
                    Switch account
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-300 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <span>⏻</span>
                    Log out
                  </button>
                </div>
              )}

              <button
                onClick={() => setProfileMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-white/[0.05]"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-semibold text-white">
                  {user?.username?.charAt(0)?.toUpperCase() || "U"}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-neutral-200">
                    {user?.username || "Account"}
                  </span>
                  <span className="block truncate text-xs text-neutral-600">
                    {user?.email}
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <section
        className={`min-h-screen pt-16 transition-all duration-300 ${
          sidebarOpen ? "md:pl-[270px]" : ""
        }`}
      >
        <div className="mx-auto w-full max-w-[1100px] px-5 pb-20 pt-16 md:px-10 lg:pt-24">
          {chat.messages.length > 0 ? (
            <MessageThread messages={chat.messages} isLoading={chat.isLoading} />
          ) : (
            <>
              {/* Greeting */}
              <div className="mb-10">
                <p className="mb-2 text-sm text-neutral-500">Good morning</p>

                <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  What do you want to know?
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
                  Ask anything. Get a clear answer backed by information from across
                  the web.
                </p>
              </div>
            </>
          )}

          {chat.error && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400"
            >
              {chat.error}
            </p>
          )}

          {limitReached && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-3">
              <p className="text-sm text-neutral-300">
                You've used all {FREE_MESSAGE_LIMIT} free messages. Upgrade to
                keep chatting.
              </p>
              <button
                onClick={() => setShowPricing(true)}
                className="flex-shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black transition hover:bg-neutral-200"
              >
                Upgrade
              </button>
            </div>
          )}

          {/* ================= SEARCH BOX ================= */}
          <div className="group relative mb-12">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-white/10 via-white/[0.04] to-white/10 opacity-0 blur transition group-focus-within:opacity-100" />

            <div className="relative rounded-2xl border border-white/[0.1] bg-[#202020] shadow-2xl transition group-focus-within:border-white/[0.16]">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder={
                  limitReached ? "Upgrade to keep chatting…" : "Ask anything..."
                }
                rows={3}
                disabled={limitReached}
                className="w-full resize-none bg-transparent px-5 pt-5 text-[15px] leading-6 text-white outline-none placeholder:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <div className="flex items-center justify-between px-4 pb-3">
                {/* Search options */}
                <div className="flex items-center gap-1">
                  <button className="flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs text-neutral-500 transition hover:bg-white/[0.06] hover:text-neutral-300">
                    <span>✦</span>
                    Focus
                  </button>

                  <button className="flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs text-neutral-500 transition hover:bg-white/[0.06] hover:text-neutral-300">
                    <span>◉</span>
                    Web
                  </button>

                  <button className="hidden h-8 items-center gap-2 rounded-lg px-2.5 text-xs text-neutral-500 transition hover:bg-white/[0.06] hover:text-neutral-300 sm:flex">
                    <span>+</span>
                    Attach
                  </button>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!query.trim() || chat.isLoading || limitReached}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                    query.trim()
                      ? "bg-white text-black hover:bg-neutral-200"
                      : "bg-white/[0.06] text-neutral-600"
                  }`}
                >
                  ↑
                </button>
              </div>
            </div>
          </div>

          {chat.messages.length === 0 && (
            <>
              {/* ================= QUICK ACTIONS ================= */}
              <div className="mb-12 grid grid-cols-2 gap-3 md:grid-cols-4">
                <QuickAction
                  icon="✦"
                  title="Deep Research"
                  description="Explore a topic deeply"
                />

                <QuickAction icon="⌘" title="Write" description="Create anything" />

                <QuickAction
                  icon="⌕"
                  title="Search"
                  description="Find information"
                />

                <QuickAction
                  icon="▤"
                  title="Analyze"
                  description="Understand data"
                />
              </div>

              {/* ================= DISCOVER ================= */}
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium">Explore</h2>
                    <p className="mt-1 text-xs text-neutral-600">
                      Discover interesting topics
                    </p>
                  </div>

                  <button className="text-xs text-neutral-500 transition hover:text-white">
                    View all →
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {trendingTopics.map((topic) => (
                    <button
                      key={topic.title}
                      className="group rounded-2xl border border-white/[0.07] bg-[#1e1e1e] p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.13] hover:bg-[#232323]"
                    >
                      <div className="mb-8 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-sm text-neutral-300 transition group-hover:bg-white/[0.1]">
                        {topic.icon}
                      </div>

                      <h3 className="mb-1 text-sm font-medium text-neutral-200">
                        {topic.title}
                      </h3>

                      <p className="text-xs leading-5 text-neutral-600">
                        {topic.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <PricingModal
        open={showPricing}
        onClose={() => setShowPricing(false)}
        messagesUsed={messagesUsed}
      />
    </main>
  );
};

/* ================= COMPONENTS ================= */

const SidebarItem = ({ icon, label, active }) => {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        active
          ? "bg-white/[0.07] text-white"
          : "text-neutral-500 hover:bg-white/[0.05] hover:text-neutral-200"
      }`}
    >
      <span className="w-5 text-center text-base">{icon}</span>
      {label}
    </button>
  );
};

const QuickAction = ({ icon, title, description }) => {
  return (
    <button className="group rounded-xl border border-white/[0.06] bg-[#1d1d1d] p-4 text-left transition hover:border-white/[0.12] hover:bg-[#222222]">
      <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-sm text-neutral-300">
        {icon}
      </div>

      <h3 className="text-sm font-medium text-neutral-300 group-hover:text-white">
        {title}
      </h3>

      <p className="mt-1 text-[11px] text-neutral-600">{description}</p>
    </button>
  );
};

export default Dashboard;
