[![npm](https://img.shields.io/npm/v/@deep-foundation/react-use-are-packages-installed.svg)](https://www.npmjs.com/package/@deep-foundation/react-use-are-packages-installed)

# Goal

Provide a React hook that checks whether deep packages are installed.

# How to use?

```ts
const { packageInstallationStatuses, loading, error } = useIsPackageInstalled({
  packageNames: ['@deep-foundation/deep-memo', '@deep-foundation/payments'],
});
```
