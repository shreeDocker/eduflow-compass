import { useEffect, useState } from "react";
import { AppLogo } from "@/components/AppLogo";
import { cn } from "@/lib/utils";

const SPLASH_MS = 4000;

type AppSplashProps = {
  onComplete: () => void;
};

export function AppSplash({ onComplete }: AppSplashProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("splash-active");
    return () => {
      document.documentElement.classList.remove("splash-active");
    };
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      document.documentElement.classList.remove("splash-active");
      onComplete();
      return;
    }

    const fadeTimer = window.setTimeout(() => setExiting(true), SPLASH_MS - 400);
    const doneTimer = window.setTimeout(() => {
      document.documentElement.classList.remove("splash-active");
      onComplete();
    }, SPLASH_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div className={cn("app-splash", exiting && "app-splash--exit")} role="presentation" aria-hidden="true">
      <div className="app-splash__container">
        <div className="app-splash__stage">
          <div className="app-splash__beam" />
          <div className="app-splash__arc app-splash__arc--1" />
          <div className="app-splash__arc app-splash__arc--2" />
          <div className="app-splash__arc app-splash__arc--3" />
        </div>
        <div className="app-splash__brand">
          <AppLogo variant="splash" subtitle="Student success OS" />
        </div>
      </div>
    </div>
  );
}
