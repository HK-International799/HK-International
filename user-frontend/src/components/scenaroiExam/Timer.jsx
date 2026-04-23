// import { useEffect, useRef, useState } from "react";
// import { Clock } from "lucide-react";

// /**
//  * Timer
//  *
//  * Persists the countdown for a specific attempt using localStorage so that
//  * if the student reloads the page, the timer continues from where it left off.
//  *
//  * Props:
//  *   - attemptId: string (used as storage key namespace)
//  *   - durationMinutes: number (total duration from exam config)
//  *   - startedAt: ISO string of when the attempt actually began server-side
//  *   - onExpire: () => void (called when countdown hits 0)
//  *   - onTick:   (remainingSeconds: number) => void
//  */
// export default function Timer({
//   attemptId,
//   durationMinutes,
//   startedAt,
//   onExpire,
//   onTick,
// }) {
//   const storageKey = `scenario-exam-timer:${attemptId}`;
//   const totalSeconds = Math.max(0, Math.floor(Number(durationMinutes) * 60));

//   // Derive initial remaining from server startedAt (source of truth),
//   // but fall back to localStorage if present (for a nicer UX on reload)
//   const computeRemaining = () => {
//     const startMs = startedAt
//       ? new Date(startedAt).getTime()
//       : Number(localStorage.getItem(`${storageKey}:started`)) || Date.now();
//     const elapsed = Math.floor((Date.now() - startMs) / 1000);
//     return Math.max(0, totalSeconds - elapsed);
//   };

//   const [remaining, setRemaining] = useState(computeRemaining);
//   const expiredRef = useRef(false);

//   useEffect(() => {
//     // Persist the authoritative started timestamp
//     if (startedAt) {
//       localStorage.setItem(
//         `${storageKey}:started`,
//         String(new Date(startedAt).getTime())
//       );
//     } else if (!localStorage.getItem(`${storageKey}:started`)) {
//       localStorage.setItem(`${storageKey}:started`, String(Date.now()));
//     }

//     const tick = () => {
//       const rem = computeRemaining();
//       setRemaining(rem);
//       onTick?.(rem);
//       if (rem <= 0 && !expiredRef.current) {
//         expiredRef.current = true;
//         onExpire?.();
//       }
//     };

//     tick();
//     const id = setInterval(tick, 1000);
//     return () => clearInterval(id);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [attemptId, durationMinutes, startedAt]);

//   const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
//   const ss = String(remaining % 60).padStart(2, "0");
//   const danger = remaining <= 60;
//   const warn = remaining <= 5 * 60;

//   return (
//     <div
//       className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-sm border ${
//         danger
//           ? "bg-red-50 border-red-200 text-red-700 animate-pulse"
//           : warn
//             ? "bg-amber-50 border-amber-200 text-amber-700"
//             : "bg-indigo-50 border-indigo-200 text-indigo-700"
//       }`}
//     >
//       <Clock size={14} />
//       <span>
//         {mm}:{ss}
//       </span>
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

/**
 * Timer — countdown driven by the server's startedAt timestamp.
 * Persists the started-at ms in localStorage so reloads stay in sync.
 */
export default function Timer({
  attemptId,
  durationMinutes,
  startedAt,
  onExpire,
  onTick,
}) {
  const storageKey = `scenario-exam-timer:${attemptId}`;
  const totalSeconds = Math.max(0, Math.floor(Number(durationMinutes) * 60));

  const computeRemaining = () => {
    const startMs = startedAt
      ? new Date(startedAt).getTime()
      : Number(localStorage.getItem(`${storageKey}:started`)) || Date.now();
    const elapsed = Math.floor((Date.now() - startMs) / 1000);
    return Math.max(0, totalSeconds - elapsed);
  };

  const [remaining, setRemaining] = useState(computeRemaining);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (startedAt) {
      localStorage.setItem(
        `${storageKey}:started`,
        String(new Date(startedAt).getTime())
      );
    } else if (!localStorage.getItem(`${storageKey}:started`)) {
      localStorage.setItem(`${storageKey}:started`, String(Date.now()));
    }

    const tick = () => {
      const rem = computeRemaining();
      setRemaining(rem);
      onTick?.(rem);
      if (rem <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, durationMinutes, startedAt]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const danger = remaining <= 60;
  const warn = remaining <= 5 * 60;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-sm font-semibold border transition-all ${
        danger
          ? "bg-red-50 border-red-300 text-red-700 animate-pulse"
          : warn
          ? "bg-amber-50 border-amber-300 text-amber-700"
          : "bg-indigo-50 border-indigo-200 text-indigo-700"
      }`}
    >
      {danger ? (
        <AlertTriangle size={14} className="flex-shrink-0" />
      ) : (
        <Clock size={14} className="flex-shrink-0" />
      )}
      <span>
        {mm}:{ss}
      </span>
    </div>
  );
}