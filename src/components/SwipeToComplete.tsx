import { useRef, useState } from "react";
import { Check, ChevronsRight } from "lucide-react";

export function SwipeToComplete({
  label,
  done,
  onComplete,
}: {
  label: string;
  done: boolean;
  onComplete: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  const THRESHOLD = 0.75;

  function onDown(clientX: number) {
    if (done) return;
    startX.current = clientX;
    setDragging(true);
  }
  function onMove(clientX: number) {
    if (!dragging || done) return;
    const track = trackRef.current;
    if (!track) return;
    const max = track.clientWidth - 56; // knob width
    const dx = Math.max(0, Math.min(max, clientX - startX.current));
    setDragX(dx);
  }
  function onUp() {
    if (!dragging || done) return;
    setDragging(false);
    const track = trackRef.current;
    if (track && dragX / (track.clientWidth - 56) >= THRESHOLD) {
      setDragX(track.clientWidth - 56);
      onComplete();
    } else {
      setDragX(0);
    }
  }

  return (
    <div
      ref={trackRef}
      className={`swipe-track relative flex h-16 items-center overflow-hidden rounded-2xl px-2 select-none ${
        done ? "opacity-100" : ""
      }`}
      onMouseDown={(e) => onDown(e.clientX)}
      onMouseMove={(e) => onMove(e.clientX)}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchStart={(e) => onDown(e.touches[0].clientX)}
      onTouchMove={(e) => onMove(e.touches[0].clientX)}
      onTouchEnd={onUp}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 rounded-2xl"
        style={{
          width: done ? "100%" : `${dragX + 56}px`,
          backgroundColor: "color-mix(in oklab, var(--status-completed) 22%, transparent)",
          transition: dragging ? "none" : "width 220ms ease-out",
        }}
      />
      <div
        className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-xl"
        style={{
          transform: `translateX(${done ? "calc(100% * 0)" : `${dragX}px`})`,
          transition: dragging ? "none" : "transform 220ms ease-out",
          backgroundColor: done ? "var(--status-completed)" : "var(--primary)",
          color: "var(--primary-foreground)",
        }}
      >
        {done ? <Check className="h-6 w-6" /> : <ChevronsRight className="h-6 w-6 animate-swipe-hint" />}
      </div>
      <div className="relative z-10 ml-4 min-w-0 flex-1">
        <p className="truncate text-base font-semibold" style={{ color: "var(--foreground)" }}>
          {label}
        </p>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {done ? "Completed" : "Swipe right to mark complete"}
        </p>
      </div>
    </div>
  );
}
