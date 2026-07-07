import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { runLifecycleMaintenance, summarizeLifecycleRun } from '@backend/lifecycle/service'

export const lifecycleMaintenanceJob = async (): Promise<{ output: string }> => {
  const payload = await getPayload({ config: configPromise })
  const result = await runLifecycleMaintenance(payload)

  return {
    output: summarizeLifecycleRun(result),
  }
}
