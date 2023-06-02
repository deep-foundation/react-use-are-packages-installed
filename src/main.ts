import { useDeepSubscription } from '@deep-foundation/deeplinks/imports/client.js';
import { useEffect, useReducer } from 'react';

const initialState: PackageInstallationStatuses = {};

function reducer(state: PackageInstallationStatuses, action: {type: string, payload?: PackageInstallationStatuses}) {
  switch (action.type) {
    case 'updateStatuses':
      return action.payload || state;
    case 'clearStatuses':
      return initialState;
    default:
      throw new Error();
  }
}

export function useArePackagesInstalled(param: UseArePackagesInstalledParam) {
  const { packageNames, shouldIgnoreResultWhenLoading = false, onError } = param;
  const [packageInstallationStatuses, dispatch] = useReducer(reducer, initialState);

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
      dispatch({ type: 'clearStatuses' });
      return;
    }
    let newPackageInstallationStatuses: PackageInstallationStatuses = {};
    newPackageInstallationStatuses = packageNames.reduce<PackageInstallationStatuses>((newPackageInstallationStatuses, packageName) => {
      newPackageInstallationStatuses![packageName] = !!(data && data.find(item => item.value?.value === packageName));
      return newPackageInstallationStatuses;
    }, newPackageInstallationStatuses);
    dispatch({ type: 'updateStatuses', payload: newPackageInstallationStatuses });
  }, [data, loading, error]);

  return { packageInstallationStatuses, loading, error };
}

export interface UseArePackagesInstalledParam {
  packageNames: Array<string>;
  shouldIgnoreResultWhenLoading?: boolean;
  onError?: ({ error }: { error: { message: string } }) => void;
}

export type PackageInstallationStatuses = Record<string, boolean> | undefined;
