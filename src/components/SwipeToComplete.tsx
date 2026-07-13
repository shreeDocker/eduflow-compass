import { useCallback, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type SwipeToCompleteProps = {
  done: boolean;
  onComplete: () => void;
  className?: string;
};

const KNOB = 40;
const PAD = 4;
const THRESHOLD = 0.82;

export function SwipeToComplete({ done, onComplete, className }: SwipeToCompleteProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const originX = useRef(0);

  const maxDrag = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    return Math.max(0, track.clientWidth - KNOB - PAD * 2);
  }, []);

  function reset() {
    setDragging(false);
    setDragX(0);
  }

  function complete() {
    setDragX(maxDrag());
    setDragging(false);
    onComplete();
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (done) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    originX.current = dragX;
    setDragging(true);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging || done) return;
    const max = maxDrag();
    const dx = e.clientX - startX.current;
    setDragX(Math.max(0, Math.min(max, originX.current + dx)));
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging || done) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const max = maxDrag();
    if (max > 0 && dragX / max >= THRESHOLD) {
      complete();
    } else {
      reset();
    }
  }

  const max = maxDrag();
  const progress = max > 0 ? dragX / max : 0;

  return (
    <div
      ref={trackRef}
      className={cn("swipe-complete", done && "swipe-complete--done", className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={reset}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={done ? 100 : Math.round(progress * 100)}
      aria-label="Swipe to mark topic complete"
    >
      <div
        className="swipe-complete__fill"
        style={{
          width: done ? "100%" : `${dragX + KNOB + PAD}px`,
          opacity: done ? 1 : 0.35 + progress * 0.45,
        }}
      />

      <span
        className="swipe-complete__hint"
        style={{ opacity: done ? 0 : Math.max(0, 1 - progress * 1.8) }}
      >
        Mark complete
      </span>

      <span className="swipe-complete__end" aria-hidden>
        <Check className="h-4 w-4" strokeWidth={2.5} />
      </span>

      <div
        className={cn("swipe-complete__knob", dragging && "swipe-complete__knob--dragging")}
        style={{
          transform: `translateX(${done ? max : dragX}px)${dragging ? " scale(1.04)" : ""}`,
        }}
      >
        {done ? (
          <Check className="h-4 w-4" strokeWidth={2.5} />
        ) : (
          <ArrowRight className="h-4 w-4 swipe-complete__arrow" strokeWidth={2.5} />
        )}
      </div>
    </div>
  );
}
