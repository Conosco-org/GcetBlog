import { getPayload } from 'payload'
import config from '@payload-config'
import { runArchiveMaintenance, summarizeArchiveRun } from '@backend/archive/service'

export const archiveMaintenanceJob = async (): Promise<{ output: string }> => {
  const payload = await getPayload({ config })
  const result = await runArchiveMaintenance(payload)
  return {
    output: summarizeArchiveRun(result),
  }
}
