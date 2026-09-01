@description('Static web app name')
param swaName string = 'Zephyr'

@description('Environment for the function app')
param functionAppEnvironment string = 'prod'

@description('Location for all resources.')
param location string = resourceGroup().location

var functionAppName string = 'zephyr-api-${functionAppEnvironment}-${uniqueString(resourceGroup().id)}'

resource storage 'Microsoft.Storage/storageAccounts@2025-01-01' = {
  name: 'zephyrsa${uniqueString(resourceGroup().id)}'
  location: location
  tags: {
    role: 'functionapp-storage'
  }
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}

resource staticWebApp 'Microsoft.Web/staticSites@2025-03-01' = {
  name: swaName
  location: location
  sku: {
    name: 'Free'
  }
  properties: {
    buildProperties: {
      skipGithubActionWorkflowGeneration: true
    }
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2025-01-01' = {
  parent: storage
  name: 'default'
}

resource deploymentContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2025-01-01' = {
  parent: blobService
  name: 'zephyr-function-deployments-${functionAppEnvironment}'
}

resource functionPlan 'Microsoft.Web/serverfarms@2025-03-01' = {
  name: 'zephyr-flex-plan-${functionAppEnvironment}'
  location: location
  kind: 'functionapp'
  sku: {
    name: 'FC1'
    tier: 'FlexConsumption'
  }
  properties: {
    reserved: true
  }
}

resource functionApp 'Microsoft.Web/sites@2025-03-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  tags: {
    environment: functionAppEnvironment
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: functionPlan.id
    httpsOnly: true
    functionAppConfig: {
      deployment: {
        storage: {
          type: 'blobContainer'
          value: '${storage.properties.primaryEndpoints.blob}${deploymentContainer.name}'
          authentication: {
            type: 'SystemAssignedIdentity'
          }
        }
      }
      runtime: {
        name: 'dotnet-isolated'
        version: '9.0'
      }
      scaleAndConcurrency: {
        maximumInstanceCount: 100
        instanceMemoryMB: 2048
      }
    }
    siteConfig: {
      appSettings: [
        { name: 'StorageEndpoint', value: storage.properties.primaryEndpoints.table }
      ]
      cors: {
        allowedOrigins: ['*']
      }
    }
  }
}

var storageTableDataContributorRoleId = subscriptionResourceId(
  'Microsoft.Authorization/roleDefinitions',
  '0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3'
)

var storageBlobDataContributorRoleId = subscriptionResourceId(
  'Microsoft.Authorization/roleDefinitions',
  'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
)

resource tableRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(
    storage.id,
    functionApp.id,
    storageTableDataContributorRoleId
  )
  scope: storage
  properties: {
    roleDefinitionId: storageTableDataContributorRoleId
    principalId: functionApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

resource blobRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(
    storage.id,
    functionApp.id,
    storageBlobDataContributorRoleId
  )
  scope: storage
  properties: {
    roleDefinitionId: storageBlobDataContributorRoleId
    principalId: functionApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

output functionAppName string = functionApp.name
output functionAppDomain string = functionApp.properties.defaultHostName
