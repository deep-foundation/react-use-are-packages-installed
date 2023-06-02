import {
  useDeepSubscription,
} from '@deep-foundation/deeplinks/imports/client';
import { useMemo } from 'react';

export function useArePackagesInstalled(param: UseArePackagesInstalledParam) {
  const { packageNames } = param;

  const { data, loading, error } = useDeepSubscription({
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
  }, [data, packageNames]);

  return { packageInstallationStatuses, loading, error };
}

export interface UseArePackagesInstalledParam {
  packageNames: Array<string>;
}

export type PackageInstallationStatuses = Record<string, boolean>;
