import { getCLS, getFID, getLCP, getTTFB, getFCP } from 'web-vitals'

/**
 * Reports the following to Firebase:
 *
 *  TTFB
 *  CLS
 *  FCP
 *  LCP
 *  FID
 *  All Server-Timing header values
 *
 * @param {Object} firebasePerf The firebase peformance object
 */
export default async function reportPeformanceMetrics(firebasePerf) {
  if (typeof window.performance !== 'undefined') {
    const performance = window.performance

    function reportMetric(name, value) {
      const trace = firebasePerf.trace(name)
      trace.start()
      trace.putMetric(name, value)
      trace.stop()
    }

    // Server-Timing header
    for (let metric of performance.getEntriesByType('navigation')[0].serverTiming) {
      reportMetric(metric.name, metric.duration)
    }

    const metrics = [getCLS, getFID, getLCP, getTTFB, getFCP]

    metrics.forEach(getMetric => {
      getMetric(
        metric => reportMetric(metric.name, metric.value),
        true /* report each measurement, not just the first */,
      )
    })
  }
}
