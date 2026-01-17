module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          'react-compiler': {
            // Enable for entire src directory
            sources: (filename) => filename.includes('src/'),
          },
        },
      ],
    ],
  };
};
