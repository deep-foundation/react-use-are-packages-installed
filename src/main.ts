import { useDeepSubscription } from '@deep-foundation/deeplinks/imports/client';
import { useState, useEffect, useMemo } from 'react';

export function useArePackagesInstalled(param: UseArePackagesInstalledParam) {
  const { packageNames, shouldIgnoreResultWhenLoading = false, onError } = param;
  const [packageInstallationStatuses, setPackageInstallationStatuses] = useState<PackageInstallationStatuses>(undefined);
  const { data, loading, error } = useDeepSubscription({
    type_id: {
      _id: ['@deep-foundation/core', 'Package'],
    },
    string: {
      value: {
        _in: packageNames
      },
    },
  });

  const memoizedPackageInstallationStatuses = useMemo(() => {
    if (shouldIgnoreResultWhenLoading && loading) {
      return undefined;
    }
    if (error) {
      onError?.({ error });
      return undefined;
    }
    let packageInstallationStatuses: PackageInstallationStatuses = {};
    packageInstallationStatuses = packageNames.reduce<PackageInstallationStatuses>((packageInstallationStatuses, packageName) => {
      packageInstallationStatuses![packageName] = !!(data && data.find(item => item.value?.value === packageName));
      return packageInstallationStatuses;
    }, packageInstallationStatuses);
    return packageInstallationStatuses;
  }, [data, loading, error, packageNames]);

  useEffect(() => {
    if (memoizedPackageInstallationStatuses !== undefined) {
      setPackageInstallationStatuses(memoizedPackageInstallationStatuses);
    }
  }, [memoizedPackageInstallationStatuses]);

  return { packageInstallationStatuses, loading, error };
}

export interface UseArePackagesInstalledParam {
  packageNames: Array<string>;
  shouldIgnoreResultWhenLoading?: boolean;
  onError?: ({ error }: { error: { message: string } }) => void;
}

export type PackageInstallationStatuses = Record<string, boolean> | undefined;