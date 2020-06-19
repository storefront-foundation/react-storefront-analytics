import React, { useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import reportPerformanceMetrics from './reportPerformanceMetrics'
import { Router } from 'next/router'
import FirebaseContext from './FirebaseContext'

/* istanbul ignore else */
if (typeof window !== 'undefined') {
  window.__rsfFirebaseSendPerformanceMetrics = reportPerformanceMetrics
}

/**
 * Reports RUM metrics to Firebase Performance Monitoring.
 *
 * Your firebase config object must be provided as an environment variable called "FIREBASE_CONFIG".
 * To get your firebase config object:
 *
 * 1.) Go to your the Settings icon Project settings in the Firebase console.
 * 2.) In the Your apps card, select the nickname of the app for which you need a config object.
 * 3.) Select Config from the Firebase SDK snippet pane.
 * 4.) Copy the config object value and add it as an environment variable called "FIREBASE_CONFIG".
 */
export default function FirebasePerformanceMonitoring({
  firebaseSdkUrl,
  clientSideNavigationTraceName,
  children,
}) {
  let config = process.env.FIREBASE_CONFIG

  const context = useMemo(() => ({ trace: null }), [])

  useEffect(() => {
    Router.events.on('routeChangeStart', () => {
      context.trace = window.firebasePerf.trace(clientSideNavigationTraceName)
      context.trace.start() // the trace will be ended by FirebaseNavigationTrace
    })
  }, [])

  let scripts = null

  if (config) {
    scripts = (
      <>
        <link
          href="https://firebaselogging.googleapis.com"
          rel="preconnect"
          crossOrigin="anonymous"
        />
        <script
          defer
          dangerouslySetInnerHTML={{
            __html: `
          (function(sa,fbc){function load(f,c){var a=document.createElement('script');
          a.async=1;a.src=f;var s=document.getElementsByTagName('script')[0];
          s.parentNode.insertBefore(a,s);}load(sa);
          window.addEventListener('load',function(){ 
            window.firebasePerf = firebase.initializeApp(fbc).performance(); 
            __rsfFirebaseSendPerformanceMetrics(window.firebasePerf)
          });
          })(${JSON.stringify(firebaseSdkUrl)}, ${config});`,
          }}
        />
      </>
    )
  }

  return (
    <FirebaseContext.Provider value={context}>
      {scripts}
      {children}
    </FirebaseContext.Provider>
  )
}

FirebasePerformanceMonitoring.propTypes = {
  /**
   * The CDN URL for the standalone firebase SDK
   */
  firebaseSdkUrl: PropTypes.string.isRequired,
  /**
   * The name of the custom trace used to capture client side navigation time.
   * Defaults to "client-side-navigation".
   *
   * To track client side navigation time, you need to add `<TrackPageView/>` to
   * each page component in your app.
   */
  clientSideNavigationTraceName: PropTypes.string,
}

FirebasePerformanceMonitoring.defaultProps = {
  clientSideNavigationTraceName: 'client-side-navigation',
  firebaseSdkUrl: 'https://www.gstatic.com/firebasejs/7.15.1/firebase-performance-standalone.js',
}
