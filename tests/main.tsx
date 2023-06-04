import dotenv from 'dotenv';
import {
  DeepClient,
  DeepProvider,
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
dotenv.config();

const requiredEnvNames = ['GRAPHQL_PATH', 'TOKEN', 'PACKAGE_NAMES'];

requiredEnvNames.forEach((name) => {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
});

const path = process.env.GRAPHQL_PATH!;
console.log('graphQlPath', path);

const token = process.env.TOKEN!;
console.log('token', token);

const packageNames = process.env.PACKAGE_NAMES!.split(',').map((name) => name.trim());
const timeout = process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 10000;

const apolloClient = generateApolloClient({
  path,
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
      value: {
        _in: packageNames,
      },
    },
  });
  const installedPackageNames = new Set(installedPackageLinks.map((link: any) => link.value.value))
  assert.equal(installedPackageNames.size, packageNames.length, 'Number of installed packages is not equal to number of packages requested');
});

describe('main', () => {
  it('installed packages', async () => {
    let deepSubscriptionResult: UseArePackagesInstalledResult;
    const TestComponent = () => {
      deepSubscriptionResult = useArePackagesInstalled({ deep, packageNames });
      console.log('testresult', deepSubscriptionResult);
      return null;
    };

    render(
      <ApolloProvider client={deep.apolloClient}>
        <DeepProvider>
          <TestComponent />
        </DeepProvider>
      </ApolloProvider>
    );

    await waitFor(
      () => {
        assert.equal(deepSubscriptionResult.loading, false, 'Loading is true');
        assert.equal(deepSubscriptionResult.error, undefined, 'Error is not undefined');
        assert.notEqual(
          deepSubscriptionResult.packageInstallationStatuses,
          undefined,
          'Package installation statuses is undefined'
        );
        const packageInstallationStatuses = deepSubscriptionResult.packageInstallationStatuses!;
        assert.equal(
          Object.keys(packageInstallationStatuses).length,
          packageNames.length,
          'Number of packages installed is not equal to number of packages requested'
        );
        Object.entries(packageInstallationStatuses).forEach(
          ([packageName, status]) => {
            assert.isTrue(
              status,
              `${packageName} installation status is false`
            );
          }
        );
      },
      {
        timeout,
      }
    );
  });
});
