module.exports = {
  paths: {
    watched: ['src'],
    public: 'public',
  },
  files: {
    javascripts: {
      entryPoints: {
        'src/popup/popup.js': {
          'popup.js': 'src/popup/popup.js',
        },
        'src/background.js': {
          'background.js': 'src/background.js',
        }
      },
    },
    stylesheets: {
      joinTo: {
        'popup.css': 'src/**/*.css',
      }
    },
  },
  modules: {
    wrapper: false,
  },
  plugins: {
    htmlPages: {
      destination(path) {
        return path.replace(/^.*[\/\\](.*)\.html$/, "$1.html");
      }
    }
  },
};
