import type { Config } from 'jest'

const jestConfig: Config = {
  testEnvironment: 'jsdom',
  verbose: true,
  testEnvironmentOptions: {
    url: "http://localhost/"
  }
}

export default jestConfig