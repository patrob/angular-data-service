// eslint-disable-next-line no-undef
module.exports = {
  transform: {
    "<rootDir>/tsconfig.spec.json": ["ts-jest", { isolatedModules: true }],
  },
  preset: "jest-preset-angular",
  transformIgnorePatterns: [
    "node_modules/(?!@angular|uuid|ng-hcaptcha|rxjs|angular-auth-oidc-client|@testing-library/angular|ngx-file-drag-drop|@fortawesome/angular-fontawesome|@vermeer-corp/component-library-angular|@rxweb/reactive-form-validators)",
  ],
  setupFilesAfterEnv: ["<rootDir>/setupJest.ts"],
  coverageReporters: ["cobertura", "lcov"],
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "<rootDir>/node_modules",
    "<rootDir>/projects/ngx-data-service/node_modules",
  ],
  maxWorkers: 3,
};
