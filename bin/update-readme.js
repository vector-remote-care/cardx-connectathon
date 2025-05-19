const fs = require('fs');
const path = require('path');
const {getObservationCiedConnectivityResources} = require('../src/fetch.js');
const {parseResource, parseMap} = require('../src/parse.js');
const templatePath = path.resolve(__dirname, '../template/readme-template.md');
const outputPath = path.resolve(__dirname, '../README.md');

// For each table header, specify if it should be hidden, and specifiy a format cb function
const tableConfig = {
  patient: {},
  device: {},
  effective: {hidden: true},
  note: {},
  connectivityStatus: {format: (value) => `**${value}**`},
  connectivityModifier: {},
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

  results.sort((a, b) => a.effective - b.effective);

  const readmeTemplate = fs.readFileSync(templatePath, 'utf8');
  let output = readmeTemplate + '\n\n## Cied Connectivity Observations\n\n';

  // Output as markdown table using tableConfig
  const visibleKeys = Object.keys(parseMap).filter(
    (key) => !tableConfig[key]?.hidden
  );

  const tableHeader = visibleKeys.map((key) => `| ${key} `).join('') + '|';
  const tableSeparator = visibleKeys.map(() => '| --- ').join('') + '|';
  const tableRows = results.map((result) => {
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