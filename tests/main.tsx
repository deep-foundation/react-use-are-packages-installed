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

const graphQlPath = process.env.GRAPHQL_PATH!;
const token = process.env.TOKEN!;
const packageNames = process.env.PACKAGE_NAMES!.split(',');
const timeout = process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 10000;

const apolloClient = generateApolloClient({
  path: graphQlPath,
  ssl: true,
});
const deep = new DeepClient({ apolloClient, token });

describe('main', () => {
  it('installed packages', async () => {
    let testResult;
    const TestComponent = () => {
      testResult = useArePackagesInstalled({ deep, packageNames });
      return null;
    };

    render(
      <ApolloProvider client={apolloClient}>
          <DeepProvider>
            <TestComponent />
          </DeepProvider>
      </ApolloProvider>
    );

    await waitFor(
      () => {
        expect(testResult.current.loading).toBe(false);
        expect(testResult.current.error).toBe(undefined);
        expect(testResult.current.packageInstallationStatuses).not.toBe(undefined);
        expect(testResult.current.packageInstallationStatuses!.length).toBe(
          packageNames.length
        );
      },
      {
        timeout,
      }
    );
  });
});
