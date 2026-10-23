"use client";

import { Link } from "@/lib/router";

type LogoSize = "sm" | "md" | "lg";

type LogoProps = {
  href?: string | null;
  showWordmark?: boolean;
  size?: LogoSize;
  wordmarkClassName?: string;
  className?: string;
};

const markSize: Record<LogoSize, number> = {
  sm: 28,
  md: 32,
  lg: 40,
};

export default function Logo({
  href = "/",
  showWordmark = true,
  size = "md",
  wordmarkClassName = "text-xl font-bold text-indigo-600 tracking-tight",
  className = "",
}: LogoProps) {
  const px = markSize[size];
  const content = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src="/logo-mark.svg"
        alt={showWordmark ? "" : "DineFlow"}
        width={px}
        height={px}
        className="shrink-0"
      />
      {showWordmark ? <span className={wordmarkClassName}>DineFlow</span> : null}
    </span>
  );

  if (href === null) {
    return content;
  }

  return (
    <Link to={href} className="inline-flex items-center no-underline">
      {content}
    </Link>
  );
}
