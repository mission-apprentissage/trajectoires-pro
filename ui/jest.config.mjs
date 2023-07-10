const esModules = ["@codegouvfr*"].join("|");

export default {
  setupFilesAfterEnv: ["<rootDir>/.jest/setup-jest.js"],

  collectCoverage: true,
  // on node 14.x coverage provider v8 offers good speed and more or less good report
  coverageProvider: "v8",
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!<rootDir>/out/**",
    "!<rootDir>/.next/**",
    "!<rootDir>/*.config.js",
    "!<rootDir>/coverage/**",
  ],
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    // https://jestjs.io/docs/webpack#mocking-css-modules
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",

    // Handle CSS imports (without CSS modules)
    "^.+\\.(css|sass|scss)$": "<rootDir>/.jest/__mocks__/styleMock.js",

    // Handle image imports
    // https://jestjs.io/docs/webpack#handling-static-assets
    "^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg|ico)$/i": `<rootDir>/.jest/__mocks__/fileMock.js`,
    "\\.svg$": "identity-obj-proxy",

    // Handle module aliases
    "^#/(.*)$": "<rootDir>/$1",
  },
  modulePathIgnorePatterns: ["types"],
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
  transform: {
    // Use babel-jest to transpile tests with the next/babel preset
    // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
    ".+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2|ico)$": "<rootDir>/.jest/__mocks__/fileTransformer.js",
  },
  transformIgnorePatterns: [
    `/node_modules/(?!${esModules}).+.(js|jsx|mjs|cjs|ts|tsx)$`,
    //  "/node_modules/",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
};
