import dotEnv from 'dotenv';
dotEnv.config();
import { DeepClient } from '@deep-foundation/deeplinks/imports/client';
import { generateApolloClient } from '@deep-foundation/hasura/client';
import { renderHook, waitFor } from '@testing-library/react';
import { useArePackagesInstalled } from '../src/main';
import { assert } from 'chai';

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
  it('installed packages', () => {
    const { result } = renderHook(() =>
      useArePackagesInstalled({ deep, packageNames })
    );

    waitFor(
      () => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(undefined);
        expect(result.current.packageInstallationStatuses).not.toBe(undefined);
        expect(result.current.packageInstallationStatuses!.length).toBe(
          packageNames.length
        );
      },
      {
        timeout,
      }
    );
  });
});
