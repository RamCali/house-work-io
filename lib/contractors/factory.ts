import { ContractorClient } from "./types"
import { ManualContractorClient } from "./manual-client"
import { JobberContractorClient } from "./jobber-client"
import { HousecallProContractorClient } from "./housecall-client"

export interface ContractorIntegration {
  type: "MANUAL" | "JOBBER" | "HOUSECALL_PRO"
  config?: any
}

/**
 * Factory to create the appropriate contractor client based on integration type
 */
export function createContractorClient(
  contractorId: string,
  integration: ContractorIntegration
): ContractorClient {
  switch (integration.type) {
    case "MANUAL":
      return new ManualContractorClient(contractorId)
    
    case "JOBBER":
      const jobberApiKey = integration.config?.apiKey || "MOCK_KEY"
      return new JobberContractorClient(jobberApiKey)
    
    case "HOUSECALL_PRO":
      const hcpApiKey = integration.config?.apiKey || "MOCK_KEY"
      return new HousecallProContractorClient(hcpApiKey)
    
    default:
      // Default to manual
      return new ManualContractorClient(contractorId)
  }
}
