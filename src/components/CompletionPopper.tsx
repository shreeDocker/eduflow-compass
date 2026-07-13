import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CompletionPopperProps = {
  show: boolean;
  message?: string;
  submessage?: string;
  onDone?: () => void;
  duration?: number;
  /** Full-viewport backdrop + centered celebration (milestones only) */
  fullScreen?: boolean;
};

const CONFETTI_COLORS = [
  "var(--sw-gold-500)",
  "var(--sw-emerald-500)",
  "var(--sw-sapphire-400)",
  "var(--sw-violet-500)",
  "var(--sw-coral-400)",
  "#f472b6",
  "#38bdf8",
];

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  rotate: number;
  size: number;
  drift: number;
  color: string;
  startTop: number;
  duration: number;
};

function buildConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    delay: Math.random() * 0.35,
    rotate: Math.random() * 360,
    size: 5 + Math.random() * 9,
    drift: (Math.random() - 0.5) * 140,
    color: CONFETTI_COLORS[id % CONFETTI_COLORS.length],
    startTop: -8 - Math.random() * 20,
    duration: 1.8 + Math.random() * 1.2,
  }));
}

function ConfettiBurst({ pieces }: { pieces: ConfettiPiece[] }) {
  return (
    <>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute"
          style={{
            left: `${p.left}%`,
            top: `${p.startTop}%`,
            width: p.size,
            height: p.size * 0.65,
            backgroundColor: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            ["--drift" as string]: `${p.drift}px`,
            ["--rot" as string]: `${p.rotate}deg`,
          }}
        />
      ))}
    </>
  );
}

export function CompletionPopper({
  show,
  message = "Completed!",
  submessage,
  onDone,
  duration,
  fullScreen = false,
}: CompletionPopperProps) {
  const resolvedDuration = duration ?? (fullScreen ? 1800 : 1200);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const onDoneRef = useRef(onDone);

  onDoneRef.current = onDone;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      setExiting(false);
      setConfetti([]);
      return;
    }

    setConfetti(buildConfetti(fullScreen ? 48 : 24));
    setVisible(true);
    setExiting(false);

    const exitAt = Math.max(400, resolvedDuration - 350);
    const exitTimer = window.setTimeout(() => setExiting(true), exitAt);
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
      setExiting(false);
      setConfetti([]);
      onDoneRef.current?.();
    }, resolvedDuration);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, [show, resolvedDuration, fullScreen]);

  if (!mounted || !visible) return null;

  const showToast = !fullScreen;

  return createPortal(
    <>
      {fullScreen && (
        <div
          className={cn(
            "pointer-events-none fixed inset-0 z-[9997] bg-black/40 backdrop-blur-[1px]",
            exiting ? "animate-completion-out" : "animate-completion-in",
          )}
          aria-hidden
        />
      )}

      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-[9998] overflow-hidden",
          exiting ? "animate-completion-out" : "animate-completion-in",
        )}
        aria-hidden
      >
        <ConfettiBurst pieces={confetti} />
      </div>

      {fullScreen && (
        <div
          className={cn(
            "pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center px-6",
            exiting ? "animate-toast-out" : "animate-toast-in",
          )}
          aria-hidden
        >
          <div className="flex max-w-xs flex-col items-center text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--min-green)] text-[var(--min-bg)] shadow-[0_0_32px_color-mix(in_oklab,var(--min-green)_30%,transparent)]">
              <Check className="h-7 w-7 animate-pop-check" strokeWidth={2.5} />
            </span>
            <p className="mt-3 font-display text-lg font-semibold text-theme">{message}</p>
            {submessage && (
              <p className="mt-1 text-sm text-theme-muted">{submessage}</p>
            )}
          </div>
        </div>
      )}

      {showToast && (
        <div
          className={cn(
            "pointer-events-none fixed inset-x-0 bottom-[calc(var(--nav-h)+0.75rem+env(safe-area-inset-bottom))] z-[10000] flex justify-center px-4 lg:bottom-8",
            exiting ? "animate-toast-out" : "animate-toast-in",
          )}
          role="status"
          aria-live="polite"
        >
          <div className="flex max-w-sm items-center gap-3 rounded-2xl border border-[var(--min-border)] bg-[var(--min-surface)] py-2.5 pl-2.5 pr-4 shadow-[var(--min-shadow)] max-lg:border-none">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--min-green)] text-[var(--min-bg)]">
              <Check className="h-3.5 w-3.5 animate-pop-check" strokeWidth={2.5} />
            </span>
            <div className="min-w-0 text-left">
              <p className="truncate font-display text-[14px] font-semibold text-theme">
                {message}
              </p>
              {submessage && (
                <p className="truncate text-[12px] text-theme-muted">{submessage}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}
