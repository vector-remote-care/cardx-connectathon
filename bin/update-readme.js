const fs = require('fs');
const path = require('path');
const {getObservationCiedConnectivityResources,getDeviceResources} = require('../src/fetch.js');
const {parseResource, parseMap} = require('../src/parse.js');
const templatePath = path.resolve(__dirname, '../template/readme-template.md');
const outputPath = path.resolve(__dirname, '../README.md');

// For each table header, specify if it should be hidden, and specifiy a format cb function
const tableConfig = {
  patient: {},
  device: {hidden: true},
  manufacturer: {hidden: true},
  serialNumber: {hidden: true, label: 'Serial'},
  modelNumber: {label: 'Model'},
  effective: {hidden: true},
  note: {},
  connectivityStatus: {
    format: (value) => {
      if(value !== 'connected') {
        return `$\${\\color{red}${value}}$$`;
      }
      return `**${value}**`;
    },
    label: 'Status',
  },
  connectivityModifier: {
    label: ' ',
  },
  lastCiedConnectivityDate: {hidden: true},
  lastMonitorConnectivityDate: {hidden: true},
  nextCiedConnectivityDate: {hidden: true},
  nextMonitorConnectivityDate: {hidden: true},
  lastRemoteInterrogationDate: {hidden: true},
  nextScheduledRemoteInterrogationDate: {hidden: true},
};

(async () => {
  // fetch the data from HAPI FHIR test server
  const data = await getObservationCiedConnectivityResources();

  // Parse using provided FHIR Paths (https://confluence.hl7.org/spaces/COD/pages/345541798/FHIRPath)
  const results = data.map(parseResource);

  const resultsWithMfgData = await Promise.all(
    results.map(async (result) => {
      const deviceId = result.device;
      if (!deviceId) {
        return result;
      }
      const deviceResource = await getDeviceResources(deviceId);
      if (!deviceResource) {
        return result;
      }

      return {
        ...result,
        manufacturer: deviceResource.manufacturer,
        serialNumber: deviceResource.serialNumber,
        modelNumber: deviceResource.modelNumber,
      };
    })
  );

  resultsWithMfgData.sort((a, b) => a.effective - b.effective);

  const readmeTemplate = fs.readFileSync(templatePath, 'utf8');
  let output = readmeTemplate + '\n\n## Cied Connectivity Observations\n\n';

  // Output as markdown table using tableConfig
  const visibleKeys = Object.keys(tableConfig).filter(
    (key) => !tableConfig[key]?.hidden
  );

  const tableHeader = visibleKeys.map((key) => `| ${tableConfig[key].label || key} `).join('') + '|';
  const tableSeparator = visibleKeys.map(() => '| --- ').join('') + '|';
  const tableRows = resultsWithMfgData.map((result) => {
    return visibleKeys
      .map((key) => {
        const value = result[key] ?? '';
        const format = tableConfig[key]?.format;
        return `| ${format ? format(value) : value} `;
      })
      .join('') + '|';
  }).join('\n');
  const table = [tableHeader, tableSeparator, tableRows].join('\n');
  output += table + '\n\n';

  fs.writeFileSync(outputPath, output, 'utf8');

})();