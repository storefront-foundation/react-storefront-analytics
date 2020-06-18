describe('reportPeformanceMetrics', () => {
  let getCLS,
    getFID,
    getLCP,
    getTTFB,
    getFCP,
    entries,
    firebasePerf,
    metrics,
    reportPeformanceMetrics

  beforeEach(() => {
    jest.isolateModules(() => {
      getCLS = jest.fn(cb => cb({ name: 'CLS', value: 'CLS' }))
      getFID = jest.fn(cb => cb({ name: 'FID', value: 'FID' }))
      getLCP = jest.fn(cb => cb({ name: 'LCP', value: 'LCP' }))
      getTTFB = jest.fn(cb => cb({ name: 'TTFB', value: 'TTFB' }))
      getFCP = jest.fn(cb => cb({ name: 'FCP', value: 'FCP' }))

      jest.doMock('web-vitals', () => ({
        getCLS,
        getFID,
        getLCP,
        getTTFB,
        getFCP,
      }))

      entries = {
        navigation: [
          {
            serverTiming: [{ name: 'cached', duration: 1 }],
          },
        ],
      }

      window.performance.getEntriesByType = type => {
        return entries[type]
      }

      metrics = []

      firebasePerf = {
        trace: jest.fn(name => {
          return {
            start: jest.fn(),
            stop: jest.fn(),
            putMetric: jest.fn((name, value) => metrics.push({ name, value })),
          }
        }),
      }

      reportPeformanceMetrics = require('../../src/firebase/reportPerformanceMetrics').default
    })
  })

  afterEach(() => {
    delete window.performance.getEntriesByType
  })

  it('should report all metrics', () => {
    reportPeformanceMetrics(firebasePerf)
    expect(metrics).toEqual([
      { name: 'cached', value: 1 },
      { name: 'CLS', value: 'CLS' },
      { name: 'FID', value: 'FID' },
      { name: 'LCP', value: 'LCP' },
      { name: 'TTFB', value: 'TTFB' },
      { name: 'FCP', value: 'FCP' },
    ])
  })

  it('should catch all errors', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation()
    expect(() => reportPeformanceMetrics({})).not.toThrowError()
    expect(warn).toHaveBeenCalled()
  })
})
