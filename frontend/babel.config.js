module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  // Silence deprecation warnings
  assumptions: {
    privateFieldsAsProperties: true,
    setPublicClassFields: true,
  },
  // Better error messages
  sourceMaps: 'inline',
  retainLines: true,
};