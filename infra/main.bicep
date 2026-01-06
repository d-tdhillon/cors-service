@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Short prefix to keep names consistent. Lowercase letters and numbers recommended.')
param namePrefix string = 'corssvc'

@description('Environment tag applied to all resources.')
param environment string = 'prod'

@description('Azure DevOps organization name (e.g., contoso).')
param adoOrg string

@description('Use managed identity instead of PAT for ADO auth.')
param useManagedIdentity bool = false

@description('Azure DevOps PAT. Leave empty when using managed identity and supply at deploy time when needed.')
@secure()
param adoPat string = ''

var uniqueSuffix = toLower(uniqueString(resourceGroup().id, namePrefix))
var shortSuffix = substring(uniqueSuffix, 0, 6)

var storageAccountBase = toLower(replace('${namePrefix}sa${uniqueSuffix}', '-', ''))
var storageAccountName = take(storageAccountBase, 24)
var workspaceName = '${namePrefix}-law-${substring(uniqueSuffix, 0, 4)}'
var appInsightsName = '${namePrefix}-appi-${substring(uniqueSuffix, 0, 4)}'
var planName = '${namePrefix}-plan-${substring(uniqueSuffix, 0, 4)}'
var functionAppName = '${namePrefix}-func-${substring(uniqueSuffix, 0, 4)}'

var commonTags = {
  Environment: environment
}

module storage 'br/public:avm/res/storage/storage-account:0.26.0' = {
  name: 'storage-account'
  params: {
    name: storageAccountName
    location: location
    tags: commonTags
  }
}

module workspace 'br/public:avm/res/operational-insights/workspace:0.12.0' = {
  name: 'log-analytics'
  params: {
    name: workspaceName
    location: location
    tags: commonTags
  }
}

module appInsights 'br/public:avm/res/insights/component:0.6.0' = {
  name: 'app-insights'
  params: {
    name: appInsightsName
    location: location
    workspaceResourceId: workspace.outputs.resourceId
    kind: 'web'
    applicationType: 'web'
    tags: commonTags
  }
}

module plan 'br/public:avm/res/web/serverfarm:0.5.0' = {
  name: 'function-plan'
  params: {
    name: planName
    location: location
    kind: 'functionapp'
    reserved: true
    skuName: 'Y1'
    tags: commonTags
  }
}

module functionApp 'br/public:avm/res/web/site:0.19.0' = {
  name: 'function-app'
  params: {
    name: functionAppName
    location: location
    kind: 'functionapp,linux'
    serverFarmResourceId: plan.outputs.resourceId
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
    managedIdentities: useManagedIdentity ? {
      systemAssigned: true
    } : null
    configs: [
      {
        name: 'appsettings'
        applicationInsightResourceId: appInsights.outputs.resourceId
        storageAccountResourceId: storage.outputs.resourceId
        properties: union(
          {
            ADO_ORG: adoOrg
          },
          useManagedIdentity ? { ADO_USE_MI: 'true' } : {},
          (!useManagedIdentity && adoPat != '') ? { ADO_PAT: adoPat } : {}
        )
      }
    ]
    siteConfig: {
      linuxFxVersion: 'NODE|20'
      minTlsVersion: '1.2'
    }
    tags: commonTags
  }
}

output functionAppName string = functionApp.outputs.name
output functionAppHostname string = functionApp.outputs.defaultHostname
output functionAppResourceId string = functionApp.outputs.resourceId
output storageAccountName string = storage.outputs.name
