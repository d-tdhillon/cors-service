import { DefaultAzureCredential } from '@azure/identity';

import { getOptionalBoolEnv, getOptionalEnv, getRequiredEnv } from './env.js';

const ADO_RESOURCE_SCOPE = '499b84ac-1321-427f-aa17-267ca6975798/.default';

export async function getAdoAuthorizationHeader(): Promise<string> {
  const useManagedIdentity = getOptionalBoolEnv('ADO_USE_MI');

  if (useManagedIdentity) {
    const credential = new DefaultAzureCredential();
    const token = await credential.getToken(ADO_RESOURCE_SCOPE);
    if (!token?.token) {
      throw new Error('Failed to acquire ADO token via DefaultAzureCredential');
    }
    return `Bearer ${token.token}`;
  }

  const pat = getOptionalEnv('ADO_PAT') ?? getRequiredEnv('ADO_PAT');
  const encoded = Buffer.from(`:${pat}`, 'utf8').toString('base64');
  return `Basic ${encoded}`;
}
