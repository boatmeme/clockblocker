module.exports = {
  roots: ['<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  // Modern Node makes `globalThis.performance` non-configurable, which the fake-timers
  // implementation bundled with Jest 28 cannot hijack (it throws "Cannot assign to read
  // only property 'performance'"). We never fake `performance`, so exclude it.
  fakeTimers: {
    doNotFake: ['performance'],
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
