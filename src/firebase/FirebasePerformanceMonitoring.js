import React, { memo } from 'react'
import PropTypes from 'prop-types'
import reportPerformanceMetrics from './reportPerformanceMetrics'

if (typeof window !== 'undefined') {
  window.__rsfFirebaseSendPerformanceMetrics = reportPerformanceMetrics
}

export default function FirebasePerformanceMonitoring({ firebaseSdkUrl, config }) {
  return (
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
          })(${JSON.stringify(firebaseSdkUrl)}, ${JSON.stringify(config)});`,
        }}
      />
    </>
  )
}

FirebasePerformanceMonitoring.propTypes = {
  /**
   * The CDN URL for the standalone firebase SDK
   */
  firebaseSdkUrl: PropTypes.string.isRequired,
  /**
   * Your firebase config.  You can get this from the Firebase console at
   * Settings => General => Your Apps => Firebase SDK Snippet => Config
   */
  config: PropTypes.any.isRequired,
  /**
   * The name of the custom trace used to capture client side navigation time.
   * Defaults to "client-side-navigation".
   */
  clientSideNavigationTraceName: PropTypes.string,
}

FirebasePerformanceMonitoring.defaultProps = {
  clientSideNavigationTraceName: 'client-side-navigation',
  firebaseSdkUrl: 'https://www.gstatic.com/firebasejs/7.15.1/firebase-performance-standalone.js',
}
