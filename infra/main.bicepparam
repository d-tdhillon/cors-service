using './main.bicep'

param location = 'eastus'
param namePrefix = 'corssvc'
param environment = 'prod'
param adoOrg = 'your-ado-org'
param useManagedIdentity = false
// Leave adoPat empty and provide via pipeline secret for non-MI deployments
param adoPat = ''
