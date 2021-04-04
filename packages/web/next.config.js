const withTM = require('next-transpile-modules')([
  'shared',
  'styled-components',
]);

module.exports = withTM({
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Transform all direct `react-native` imports to `react-native-web`
      'react-native$': 'react-native-web',
    };

    return config;
  },
});
