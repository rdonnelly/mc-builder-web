const withTM = require('next-transpile-modules')([
  'shared',
  'styled-components',
  'react-native-render-html',
  'react-native-vector-icons/dist',
]);

module.exports = withTM({
  future: {
    webpack5: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Transform all direct `react-native` imports to `react-native-web`
      'react-native$': 'react-native-web',
      'react-native-vector-icons/FontAwesome5Pro$':
        'react-native-vector-icons/dist/FontAwesome5Pro',
    };

    return config;
  },
  async headers() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ];
  },
});
