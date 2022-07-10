// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharedConfig = require('./jest.config');

module.exports = {
  ...sharedConfig,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  // collectCoverageFrom: undefined,

  reporters: ['default', ['jest-junit', { outputDirectory: 'coverage', outputName: 'unit-test-result.xml' }]],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ['/node_modules/'],

  // An object that configures minimum threshold enforcement for coverage results
  // There is a coverage issue where swc-jest is not reporting the correct coverage
  // thus we lowered the branch coverage to 75 to accommodate
  // https://github.com/swc-project/swc/issues/3854
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};
