import {
  DeepClient,
  useDeepSubscription,
} from '@deep-foundation/deeplinks/imports/client.js';
import { useMemo } from 'react';

export function useArePackagesInstalled(param: UseArePackagesInstalledParam) {
  const { packageNames, deep } = param;

  const { data, loading, error } = deep.useDeepSubscription({
    type_id: {
      _id: ['@deep-foundation/core', 'Package'],
    },
    string: {
      value: {
        _in: packageNames,
      },
    },
  });

  const packageInstallationStatuses: PackageInstallationStatuses | undefined = useMemo(() => {
    if (!data) {
      return undefined;
    } else {
      return packageNames.reduce<PackageInstallationStatuses>(
        (acc, packageName) => {
          acc[packageName] = !!data.find(
            (item) => item.value?.value === packageName
          );
          return acc;
        },
        {} as PackageInstallationStatuses
      );
    }
  }, [data]);

  return { packageInstallationStatuses, loading, error };
}

export interface UseArePackagesInstalledParam {
  deep: DeepClient;
  packageNames: Array<string>;
}

export type PackageInstallationStatuses = Record<string, boolean>;
