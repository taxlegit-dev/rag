import { PropagateLoader } from "react-spinners";

interface GeneratingLoaderProps {
  message?: string;
}

export default function GeneratingLoader({
  message = "Working on it...",
}: GeneratingLoaderProps) {
  return (
    <div className="bg-slate-900/70 rounded-2xl border border-purple-500/20 p-10 text-center shadow-2xl">
      <div className="flex flex-col items-center gap-6">
        <PropagateLoader color="#c084fc" />
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-purple-300">
            Please hold on
          </p>
          <h3 className="text-2xl font-semibold text-white mt-2">
            {message || "Generating your SOP..."}
          </h3>
        </div>
        <p className="text-gray-400 max-w-xl">
          We are creating a detailed SOP tailored to the process you selected.
          You can continue once it is ready.
        </p>
      </div>
    </div>
  );
}

