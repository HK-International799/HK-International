import { onLCP, onCLS, onINP, onFCP, onTTFB } from "web-vitals";

/**
 * Real User Monitoring for Core Web Vitals.
 *
 * This reports what actual visitors experience (their device, their
 * network) — a lab test like PageSpeed Insights only tests one simulated
 * machine/connection, so this is what Search Console's "Core Web Vitals"
 * report is ultimately built from at the field-data level.
 *
 * Wire this up in src/main.jsx: `import { reportWebVitals } from "./lib/vitals"; reportWebVitals();`
 *
 * Targets (Google's "Good" thresholds):
 *   LCP  < 2.5s
 *   CLS  < 0.1
 *   INP  < 200ms
 */
export function reportWebVitals(onReport) {
  const handleMetric = (metric) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[web-vitals] ${metric.name}:`, metric.value, metric);
    }
    if (onReport) {
      onReport(metric);
    }
    // To send this to Google Analytics 4 (if/when GA4 is added), swap the
    // console.log above for something like:
    //   window.gtag?.("event", metric.name, {
    //     value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
    //     metric_id: metric.id,
    //     metric_value: metric.value,
    //     metric_delta: metric.delta,
    //   });
  };

  onLCP(handleMetric);
  onCLS(handleMetric);
  onINP(handleMetric);
  onFCP(handleMetric);
  onTTFB(handleMetric);
}
