import distribution from './distribution.json';

/** Public presentation only. Payment credentials belong on a server. */
export const product = {
  name: distribution.brandName,
  cli: { packageName: distribution.cliPackage, tag: distribution.cliTag, sourceDirectory: distribution.sourceDirectory, published: distribution.published, localAvailable: distribution.localAvailable },
  integrations: {
    name: distribution.sourceDirectory,
    configFile: distribution.configFile,
    mcpPublished: distribution.mcpPublished,
    mcpLocalAvailable: distribution.mcpLocalAvailable,
    skillsPublished: distribution.skillsPublished,
    skillsLocalAvailable: distribution.skillsLocalAvailable,
  },
  templatePack: {
    name: 'Template Pack',
    pricing: 'pay-what-you-want',
    suggestedUsd: 1,
    minimumUsd: 0,
    presetsUsd: [0, 1, 5, 10, 15],
    paymentsEnabled: false,
  },
} as const;
