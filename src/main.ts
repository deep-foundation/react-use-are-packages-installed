import { useDeepSubscription } from '@deep-foundation/deeplinks/imports/client';
import { useState, useEffect } from 'react';

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
  useEffect(() => {
    if (shouldIgnoreResultWhenLoading && loading) {
      return;
    }
    if (error) {
      onError?.({ error });
      setPackageInstallationStatuses(undefined);
      return;
    }
    let packageInstallationStatuses: PackageInstallationStatuses = {};
    packageInstallationStatuses = packageNames.reduce<PackageInstallationStatuses>((packageInstallationStatuses, packageName) => {
      packageInstallationStatuses!.packageName = !!(data && data.find(item => item.value?.value === packageName));
      return packageInstallationStatuses;
    }, packageInstallationStatuses);
    setPackageInstallationStatuses(packageInstallationStatuses);
  }, [data, loading, error]);

  return { isPackageInstalled: packageInstallationStatuses, loading, error };
}



export interface UseArePackagesInstalledParam {
  packageNames: Array<string>;
  shouldIgnoreResultWhenLoading?: boolean;
  onError?: ({ error }: { error: { message: string } }) => void;
}

export type PackageInstallationStatuses = Record<string, boolean|undefined> | undefined;