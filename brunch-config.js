module.exports = {
  paths: {
    watched: ['src'],
    public: 'public',
  },
  files: {
    javascripts: {
      joinTo: {
        'popup.js': 'src/popup/*js',
        'background.js': 'src/background.js',
      },
    },
    stylesheets: {
      joinTo: {
        'popup.css': 'src/**/*.css',
      },
    },
  },
  modules: {
    wrapper: 'commonjs',
  },
  plugins: {
    htmlPages: {
      destination(path) {
        return path.replace(/^.*[\/\\](.*)\.html$/, "$1.html");
      },
    },
    uglify: {
      compress: {
        sequences: true,
      },
    },
  },
};
