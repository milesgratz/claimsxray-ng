var fs = require('fs');
var packageInfo = require('./package.json');

const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `export const environment = {
  production: true,
  samlProxyUrl: '',
  appInsights: {
    connectionString: '${process.env['APPINSIGHTS_CONNECTION_STRING']}'
  },
  name: '${packageInfo.name}',
  version: '${packageInfo.version}'
};
`;

fs.writeFile(targetPath, envConfigFile, 'utf8', (err) => {
  if (err) {
    return console.log(err);
  }
});