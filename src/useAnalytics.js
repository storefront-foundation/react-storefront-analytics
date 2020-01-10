import { useContext } from 'react'
import AnalyticsContext from './AnalyticsContext'

const useAnalytics = () => {
  return useContext(AnalyticsContext)
}

export default useAnalytics
