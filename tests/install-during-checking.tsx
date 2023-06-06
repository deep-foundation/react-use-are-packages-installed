import dotenv from 'dotenv';
import {
  DeepClient,
  DeepProvider,
  DeepSerialOperation,
  SerialOperation,
  UseDeepSubscriptionResult,
} from '@deep-foundation/deeplinks/imports/client.js';
import { generateApolloClient } from '@deep-foundation/hasura/client.js';
import { render, waitFor } from '@testing-library/react';
import {
  UseArePackagesInstalledResult,
  useArePackagesInstalled,
} from '../src/main';
import { ApolloProvider } from '@apollo/client/index.js';
import { assert } from 'chai';
import React from 'react';
import {getInstallPackagesSerialoperations} from '@freephoenix888/deepclient-extensions'
dotenv.config();

enum RequiredEnvNames {
   GraphQlPath = 'GRAPHQL_PATH',
   Token = 'TOKEN',
   PackageNameToInstall = 'PACKAGE_NAME_TO_INSTALL',
}

enum NonRequiredEnvNames {
   Timeout = 'TIMEOUT',
}


const requiredEnvNames = Object.values(RequiredEnvNames);

requiredEnvNames.forEach((name) => {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
});

const graphQlPath = process.env[RequiredEnvNames.GraphQlPath]!;

const token = process.env[RequiredEnvNames.Token]!;

const packageNameToInstall = process.env[RequiredEnvNames.PackageNameToInstall]!;

const timeout = process.env.TIMEOUT ? parseInt(process.env[NonRequiredEnvNames.Timeout]) : 10000;

const apolloClient = generateApolloClient({
  path: graphQlPath,
  ssl: true,
  ws: true,
  token,
});
let deep = new DeepClient({ apolloClient });

beforeAll(async () => {
  await deep.whoami();
  assert.notEqual(deep.linkId, 0);
  assert.notEqual(deep.linkId, undefined);
  const {data: installedPackageLinks} = await deep.select({
   type_id: {
     _id: ['@deep-foundation/core', 'Package'],
   },
   string: {
     value: packageNameToInstall,
   },
 });
 assert.equal(installedPackageLinks.length, 0, `${packageNameToInstall} is already installed`);
});

describe('main', () => {
  it('installed packages', async () => {
   const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
   const installTypeLinkId = await deep.id("@deep-foundation/npm-packager", "Install");
   const packageQueryTypeLinkId = await deep.id("@deep-foundation/core", "PackageQuery");
    let deepSubscriptionResult: UseArePackagesInstalledResult;
    const TestComponent = () => {
      deepSubscriptionResult = useArePackagesInstalled({ deep, packageNames: [packageNameToInstall] });
      return null;
    };

    render(
      <ApolloProvider client={deep.apolloClient}>
        <DeepProvider>
          <TestComponent />
        </DeepProvider>
      </ApolloProvider>
    );

    const reservedLinkIds = await deep.reserve(2);
    const containLinkId = reservedLinkIds.pop();
    const installLinkId = reservedLinkIds.pop();

    // Install package
    const installPackageSerialOperationsPerPackageName = await getInstallPackagesSerialoperations({
      deep,
      packagesData: [
         {
            name: packageNameToInstall,
            containData: {
               linkId: containLinkId,
               value: ""
            },
            containerLinkId: deep.linkId,
            installLinkId: installLinkId,
         }
      ],
      typeLinkIds: {
         containTypeLinkId,
         installTypeLinkId,
         packageQueryTypeLinkId
      }
    })
    

    await waitFor(
      () => {
        assert.equal(deepSubscriptionResult.loading, false, 'Loading is true');
        assert.equal(deepSubscriptionResult.error, undefined, 'Error is not undefined');
        const packageInstallationStatuses = deepSubscriptionResult.packageInstallationStatuses!;
        assert.notEqual(
         packageInstallationStatuses,
          undefined,
          'Package installation statuses is undefined'
        );
        assert.equal(
          Object.keys(packageInstallationStatuses).length,
          0,
          `Number of installed ${packageNameToInstall} packages is changed without a reason`
        );
      },
      {
        timeout,
      }
    );

    const installPackageSerialOperations = installPackageSerialOperationsPerPackageName[packageNameToInstall]

    const {data: [installPackageLink, containLink]} = await deep.serial({
      operations: installPackageSerialOperations
    })

    await waitFor(
      () => {
        assert.equal(deepSubscriptionResult.loading, false, 'Loading is true');
        assert.equal(deepSubscriptionResult.error, undefined, 'Error is not undefined');
        const packageInstallationStatuses = deepSubscriptionResult.packageInstallationStatuses!;
        assert.notEqual(
         packageInstallationStatuses,
          undefined,
          'Package installation statuses is undefined'
        );
        assert.equal(
          Object.keys(packageInstallationStatuses).length,
          0,
          `Number of installed ${packageNameToInstall} packages is changed without a reason`
        );
      },
      {
        timeout,
      }
    );
  });
});
