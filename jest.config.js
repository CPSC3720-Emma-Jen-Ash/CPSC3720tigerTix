// jest.config.js
export default {
  testEnvironment: "node",
  transform: {},              // disable babel transforms
  verbose: true,
  // remove extensionsToTreatAsEsm
  moduleFileExtensions: ["js", "json"],
  roots: ["<rootDir>/tests"],
  moduleDirectories: ["node_modules", "backend"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1", // allow bare ESM imports
  },
};