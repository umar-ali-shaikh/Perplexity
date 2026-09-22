import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents = {
  p: ({ children }) => (
    <p className="mb-4 text-[15px] leading-7 text-neutral-300 last:mb-0">
      {children}
    </p>
  ),
  h1: ({ children }) => (
    <h1 className="mb-3 mt-6 text-xl font-semibold text-white first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-6 text-lg font-semibold text-white first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-5 text-base font-semibold text-white first:mt-0">
      {children}
    </h3>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-1.5 pl-5 text-[15px] leading-7 text-neutral-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-[15px] leading-7 text-neutral-300">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 underline underline-offset-2 hover:text-blue-300"
    >
      {children}
    </a>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[13px] text-neutral-200">
        {children}
      </code>
    ) : (
      <code className="block font-mono text-[13px] leading-6 text-neutral-200">
        {children}
      </code>
    ),
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-xl border border-white/[0.08] bg-[#1a1a1a] p-4">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-2 border-white/20 pl-4 text-neutral-400">
      {children}
    </blockquote>
  ),
};

export const MessageThread = ({ messages, isLoading }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  const lastMessage = messages[messages.length - 1];
  const isWaitingForReply = isLoading && lastMessage?.role === "user";

  return (
    <div className="flex flex-col gap-8 pb-8">
      {messages.map((message, index) => (
        <div
          key={message._id ?? `${message.role}-${index}`}
          className={
            message.role === "user" ? "flex justify-end" : "flex justify-start"
          }
        >
          {message.role === "user" ? (
            <p className="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-white/[0.06] px-4 py-2.5 text-[15px] leading-6 text-white">
              {message.content}
            </p>
          ) : (
            <div className="max-w-[80%]">
              <ReactMarkdown
                components={markdownComponents}
                remarkPlugins={[remarkGfm]}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      ))}

      {isWaitingForReply && (
        <div className="flex items-center gap-1.5 text-neutral-500">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500" />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
