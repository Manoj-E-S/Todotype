const path = require('path');

module.exports = {
  entry: {},
  output: {
    filename: 'bundle.js', // Adjust the output filename as needed
    path: path.resolve(__dirname, 'public'), // Output directory
  },
};
