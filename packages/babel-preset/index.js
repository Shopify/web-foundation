module.exports = function shopifyCommonPreset(
  api,
  {
    corejs = 3,
    debug = false,
    modules = 'auto',
    useBuiltIns = 'entry',
    typescript = false,
    typescriptOptions = {},
    transformRuntime = false,
    transformRuntimeOptions = {
      corejs: false,
      helpers: true,
      // By default, babel assumes babel/runtime version 7.0.0-beta.0,
      // explicitly resolving to match the provided helper functions.
      // https://github.com/babel/babel/issues/10261
      version: require('@babel/runtime/package.json').version,
      regenerator: true,
      // This allows users to run transform-runtime broadly across a whole project.
      // By default, transform-runtime imports from @babel/runtime/foo directly, but
      // that only works if @babel/runtime is in the node_modules of the file that is being compiled.
      absoluteRuntime: false,
    },
    react = false,
    reactOptions = {
      // Will use the native built-in instead of trying to polyfill behavior for any plugins that require one.
      useBuiltIns: true,
    },
    transformReactConstantElements = false,
    isWebpack5 = false,
  } = {},
) {
  const env = api.env();
  const isDevelopment = env === 'development' || env === 'test';
  const includeTransformReactConstantElements =
    !isDevelopment && transformReactConstantElements && react;

  const presets = [
    [
      require.resolve('@babel/preset-env'),
      {
        modules,
        useBuiltIns,
        corejs,
        debug,
        bugfixes: true,
      },
    ],
    typescript && [
      require.resolve('@babel/preset-typescript'),
      {...typescriptOptions},
    ],
    react && [
      require.resolve('@babel/preset-react'),
      {
        // This toggles behavior specific to development, such as adding __source and __self.
        development: isDevelopment,
        ...reactOptions,
      },
    ],
  ].filter(Boolean);

  const plugins = [
    // proposal-decorators must go before proposal-class-properties.
    // Typescript implements the stage 1 version of decorators, which is the
    // "legacy" version.
    typescript && [
      require.resolve('@babel/plugin-proposal-decorators'),
      {legacy: true},
    ],

    // nullish-coalescing, optional-chaining, and numeric separators are handled by preset-env
    // But they aren't yet supported in webpack 4 because of missing support
    // in acorn v6 (support is in acorn v7, which is used in webpack v5).
    // So we want to always transpile this synax away
    // See https://github.com/webpack/webpack/issues/10227
    // Can be removed once we drop support for webpack v4 (or these features
    // are backported to acorn v6)
    ...(isWebpack5 === false
      ? [
          require.resolve('@babel/plugin-proposal-numeric-separator'),
          require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
          require.resolve('@babel/plugin-proposal-optional-chaining'),
        ]
      : []),

    // Polyfills the runtime needed for async/await, generators, and friends
    // https://babeljs.io/docs/en/babel-plugin-transform-runtime
    transformRuntime && [
      '@babel/plugin-transform-runtime',
      {
        ...transformRuntimeOptions,
        version: require('@babel/runtime/package.json').version,
      },
    ],
    // Hoist constant JSX elements to the top of their scope, which can
    // result in faster reconciliation
    includeTransformReactConstantElements &&
      require.resolve('@babel/plugin-transform-react-constant-elements'),
  ].filter(Boolean);

  // When decorators are used in legacy mode proposal-class-properties, plugin-proposal-private-methods must be used in loose mode (this is now handled by these assumptions)
  // see https://babeljs.io/docs/en/babel-plugin-proposal-decorators#note-compatibility-with-babel-plugin-proposal-class-properties
  // see https://babeljs.io/docs/en/babel-plugin-proposal-class-properties#loose
  // see https://babeljs.io/docs/en/babel-plugin-proposal-private-methods#loose
  // see https://babeljs.io/docs/en/assumptions
  const assumptions = typescript
    ? {
        setPublicClassFields: true,
        privateFieldsAsProperties: true,
      }
    : {};

  return {presets, plugins, assumptions};
};
