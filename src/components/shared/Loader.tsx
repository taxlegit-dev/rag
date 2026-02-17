import React from "react";
import { PropagateLoader } from "react-spinners";

interface LoaderProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export default function Loader({
  message = "Loading...",
  subMessage,
  fullScreen = true,
}: LoaderProps) {
  const containerClass = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md"
    : "flex items-center justify-center py-10";

  return (
    <div className={containerClass} aria-live="polite" aria-busy="true">
      <div className="relative rounded-2xl border border-purple-500/20 bg-slate-900/80 px-10 py-8 text-center shadow-2xl">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-purple-500/40 to-pink-500/40 blur-2xl animate-pulse" />
            <PropagateLoader color="#f472b6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-purple-200/80">
              Please wait
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              {message}
            </h3>
            {subMessage ? (
              <p className="mt-2 text-sm text-slate-300">{subMessage}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
