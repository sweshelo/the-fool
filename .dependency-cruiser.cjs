/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'warn',
      comment:
        'This dependency is part of a circular relationship. You might want to revise ' +
        'your solution (i.e. use dependency inversion, currentate modules if applicable.',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment:
        "This is an orphan module - it's likely not used. Either use it or " +
        "remove it. If it's logical this module is an orphan (i.e. it's a " +
        'contract), add it to the exclude option in your configuration.',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(c|m)?(j|t)s$', // dot files
          '\\.d\\.ts$', // TypeScript declaration files
          '(^|/)tsconfig\\.json$', // TypeScript config
          '(^|/)(babel|webpack)\\.config\\.(c|m)?(j|t)s$', // config files
          '\\.stories\\.(c|m)?(j|t)sx?$', // storybook files
          '\\.spec\\.(c|m)?(j|t)sx?$', // test files
          '\\.test\\.(c|m)?(j|t)sx?$', // test files
          'src/index\\.ts$', // entry point
        ],
      },
      to: {},
    },
    {
      name: 'no-deprecated-core',
      comment:
        'A module depends on a node core module that has been deprecated. Find an alternative - these are ' +
        'temporary and might disappear anytime. Consult the node api documentation for details.',
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: ['core'],
        path: [
          '^v8/tools/codemap$',
          '^v8/tools/consarray$',
          '^v8/tools/csvparser$',
          '^v8/tools/logreader$',
          '^v8/tools/profile_view$',
          '^v8/tools/profile$',
          '^v8/tools/SourceMap$',
          '^v8/tools/splaytree$',
          '^v8/tools/tickprocessor-driver$',
          '^v8/tools/tickprocessor$',
          '^node-hierarchyify/dist/index$',
          '^punycode$',
          '^domain$',
          '^constants$',
          '^sys$',
          '^_linklist$',
          '^_stream_wrap$',
        ],
      },
    },
    {
      name: 'not-to-deprecated',
      comment: 'This module uses a (soft) deprecated module. Please consider using an alternative.',
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: ['deprecated'],
      },
    },
    {
      name: 'no-non-package-json',
      severity: 'error',
      comment:
        "This module depends on an npm package that isn't in the 'dependencies' section of your package.json. " +
        "That's problematic because it might not be available in production. Add it to dependencies in package.json.",
      from: {},
      to: {
        dependencyTypes: ['npm-no-pkg', 'npm-unknown'],
      },
    },
    {
      name: 'not-to-unresolvable',
      comment:
        "This module depends on a module that can't be resolved to a file on disk. You may need to " +
        'install the module or add it to your build configuration.',
      severity: 'error',
      from: {},
      to: {
        couldNotResolve: true,
      },
    },
    {
      name: 'no-duplicate-dep-types',
      comment:
        "Modules should be in dependencies or devDependencies, but not both. If it's both, make a " +
        'conscious choice which one to use.',
      severity: 'warn',
      from: {},
      to: {
        moreThanOneDependencyType: true,
        dependencyTypesNot: ['type-only'],
      },
    },
    {
      name: 'not-to-dev-dep',
      severity: 'error',
      comment:
        "This module depends on an npm package from the 'devDependencies' section of your package.json. " +
        'It looks like something that ships to production, though. Remove the devDependency or move it to ' +
        "'dependencies'.",
      from: {
        path: '^(src)',
        pathNot: ['\\.spec\\.(c|m)?(j|t)sx?$', '\\.test\\.(c|m)?(j|t)sx?$'],
      },
      to: {
        dependencyTypes: ['npm-dev'],
        pathNot: ['node_modules/@types/'],
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/(@[^/]+/[^/]+|[^/]+)',
      },
      archi: {
        collapsePattern:
          '^(packages|src|lib(s?)|app(s?)|bin|test(s?)|spec(s?))/[^/]+|node_modules/(@[^/]+/[^/]+|[^/]+)',
      },
      text: {
        highlightFocused: true,
      },
    },
  },
};
