import dotenv from 'dotenv';
import { DeepClient, DeepProvider } from '@deep-foundation/deeplinks/imports/client.js';
import { generateApolloClient } from '@deep-foundation/hasura/client.js';
import { render, waitFor } from '@testing-library/react';
import { useArePackagesInstalled } from '../src/main';
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
console.log("graphQlPath", path)

const token = process.env.TOKEN!;
console.log("token", token)

const packageNames = process.env.PACKAGE_NAMES!.split(',');
const timeout = process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 10000;

const apolloClient = generateApolloClient({
  path,
  ssl: true,
  ws: true,
  token
});
console.log("apolloclient", apolloClient)

describe('main', () => {
  it('installed packages', async () => {

    const deep = new DeepClient({ apolloClient });
    await deep.whoami();

    console.log("deep.linkid", deep.linkId)

    assert.notEqual(deep.linkId, 0);
    assert.notEqual(deep.linkId, undefined);

    let testResult;
    const TestComponent = () => {
      testResult = useArePackagesInstalled({ packageNames });
      console.log("testresult", testResult)
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
        expect(testResult.loading).toBe(false);
        expect(testResult.error).toBe(undefined);
        expect(testResult.packageInstallationStatuses).not.toBe(undefined);
        expect(Object.keys(testResult.packageInstallationStatuses)).toEqual(packageNames);
      },
      {
        timeout,
      }
    );
  });
});
