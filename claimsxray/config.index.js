var fs = require('fs');

const targetPath = './src/environments/environment.prod.ts';

console.log(`connectionString: '${process.env['APPINSIGHTS_CONNECTION_STRING']}'`)

const envConfigFile = `export const environment = {
  production: true,
  samlProxyUrl: '',
  appInsights: {
    connectionString: '${process.env['APPINSIGHTS_CONNECTION_STRING']}'
  }
};
`;

fs.writeFile(targetPath, envConfigFile, 'utf8', (err) => {
  if (err) {
    return console.log(err);
  }
});