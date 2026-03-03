/**
 * Conosco Provider Factory
 *
 * Mirrors the email service factory pattern:
 * - Reads env vars → determines provider
 * - ConoscoProvider when API configured
 * - DisconnectedProvider when not configured
 *
 * Switch modes by setting/unsetting CONOSCO_API_URL env var.
 */

import type { ExternalDataProvider, TimeoutConfig } from './types'
import { DEFAULT_TIMEOUTS } from './types'
import { ConoscoProvider } from './client'
import { DisconnectedProvider } from './disconnected'
import { themeConfig } from '@/custom/theme'

// ---------------------------------------------------------------------------
// Factory configuration from environment
// ---------------------------------------------------------------------------

interface ConoscoFactoryConfig {
  provider: 'conosco' | 'disconnected'
  baseUrl?: string
  apiKey?: string
  institutionCode: string
  timeouts: TimeoutConfig
}

function getConfig(): ConoscoFactoryConfig {
  const baseUrl = process.env.CONOSCO_API_URL
  const apiKey = process.env.CONOSCO_API_KEY
  const institutionCode = process.env.CONOSCO_INSTITUTION_CODE ?? themeConfig.institutionCode

  // Parse optional timeout overrides
  const timeouts: TimeoutConfig = {
    enrichment: parseInt(process.env.CONOSCO_TIMEOUT_ENRICHMENT ?? '', 10) || DEFAULT_TIMEOUTS.enrichment,
    detail: parseInt(process.env.CONOSCO_TIMEOUT_DETAIL ?? '', 10) || DEFAULT_TIMEOUTS.detail,
    list: parseInt(process.env.CONOSCO_TIMEOUT_LIST ?? '', 10) || DEFAULT_TIMEOUTS.list,
    stats: parseInt(process.env.CONOSCO_TIMEOUT_STATS ?? '', 10) || DEFAULT_TIMEOUTS.stats,
  }

  if (!baseUrl || !apiKey) {
    if (themeConfig.features.conoscoIntegration) {
      console.warn(
        '[ConoscoFactory] CONOSCO_API_URL or CONOSCO_API_KEY not set. ' +
          'Running in disconnected mode. Set both env vars to enable Conosco integration.',
      )
    }
    return { provider: 'disconnected', institutionCode, timeouts }
  }

  return {
    provider: 'conosco',
    baseUrl,
    apiKey,
    institutionCode,
    timeouts,
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createConoscoProvider(config?: ConoscoFactoryConfig): ExternalDataProvider {
  const cfg = config ?? getConfig()

  switch (cfg.provider) {
    case 'conosco': {
      if (!cfg.baseUrl || !cfg.apiKey) {
        throw new Error('[ConoscoFactory] Cannot create ConoscoProvider without baseUrl and apiKey')
      }
      return new ConoscoProvider({
        baseUrl: cfg.baseUrl,
        apiKey: cfg.apiKey,
        institutionCode: cfg.institutionCode,
        timeouts: cfg.timeouts,
      })
    }

    case 'disconnected':
      return new DisconnectedProvider()

    default: {
      const _exhaustive: never = cfg.provider
      throw new Error(`[ConoscoFactory] Unknown provider: ${JSON.stringify(_exhaustive)}`)
    }
  }
}
