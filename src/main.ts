import {
  DeepClient,
  UseDeepSubscriptionResult,
  useDeepSubscription,
} from '@deep-foundation/deeplinks/imports/client';
import { useState, useEffect, useMemo, useRef } from 'react';

export function useArePackagesInstalled(param: UseArePackagesInstalledParam) {
  const { packageNames , deep} = param;

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

  let packageInstallationStatuses: PackageInstallationStatuses = undefined;
  if (data) {
    packageInstallationStatuses =
      packageNames.reduce<PackageInstallationStatuses>(
        (packageInstallationStatuses, packageName) => {
          packageInstallationStatuses![packageName] = !!data.find(
            (item) => item.value?.value === packageName
          );
          return packageInstallationStatuses;
        },
        {} as PackageInstallationStatuses
      );
  }

  return { packageInstallationStatuses, loading, error };
}

export interface UseArePackagesInstalledParam {
  deep: DeepClient;
  packageNames: Array<string>;
}

export type PackageInstallationStatuses = Record<string, boolean> | undefined;
