const fs = require('fs');
const path = require('path');
const {getObservationCiedConnectivityResources,getDeviceResources} = require('../src/fetch.js');
const {parseResource, deltaIfyDates, useCaseMfg} = require('../src/parse.js');
const templatePath = path.resolve(__dirname, '../template/readme-template.md');
const outputPath = path.resolve(__dirname, '../README.md');

// For each table header, specify if it should be hidden, and specifiy a format cb function
const tableConfig = {
  patient: {label: 'pt'},
  useCase: {hidden: true},
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
  const results = (await Promise.all(data
    .map(parseResource)
    .map(deltaIfyDates)
    .map(async (res) => {
      if (!res.device) {
        return res;
      }
      const deviceResource = await getDeviceResources(res.device);
      if (!deviceResource) {
        return res;
      }

      return {
        ...res,
        manufacturer: deviceResource.manufacturer,
        serialNumber: deviceResource.serialNumber,
        modelNumber: deviceResource.modelNumber,
      };
    })
  ))
  .map(useCaseMfg)
  .sort((a, b) => a.effective - b.effective);

  const readmeTemplate = fs.readFileSync(templatePath, 'utf8');
  let output = readmeTemplate + '\n\n## Cied Connectivity Observations\n\n';

  // Output as markdown table using tableConfig
  const visibleKeys = Object.keys(tableConfig).filter(
    (key) => !tableConfig[key]?.hidden
  );

  const generateTable = (results) => {
    const tableHeader = visibleKeys.map((key) => `| ${tableConfig[key].label || key} `).join('') + '|';
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
  
    const hideNan = (v) => isNaN(v) ? '-' : v;
  
    const tableDatesConfig = {
      patient: {label: 'pt'},
      effective: {format: (value) => new Date(value).toLocaleDateString('en-US')},
      lastCiedConnectivityDate: {label: 'Last Cied', format: hideNan},
      lastMonitorConnectivityDate: {label: 'Last Mon', format: hideNan},
      lastRemoteInterrogationDate: {label: 'Last Int', format: hideNan},
      nextCiedConnectivityDate: {label: 'Next Cied', format: hideNan},
      nextMonitorConnectivityDate: {label: 'Next Mon', format: hideNan},
      nextScheduledRemoteInterrogationDate: {label: 'Next Int', format: hideNan},
    };
    const tableDatesHeader = Object.keys(tableDatesConfig).map((key) => `| ${tableDatesConfig[key].label || key} `).join('') + '|';
    const tableDatesSeparator = Object.keys(tableDatesConfig).map(() => '| --- ').join('') + '|';
    const tableDatesRows = results
    .map((result) => {
      return Object.keys(tableDatesConfig)
        .map((key) => {
          const formatted = tableDatesConfig[key].format ? tableDatesConfig[key].format(result[key]) : result[key];
          return `| ${formatted} `;
        })
        .join('') + '|';
    }).join('\n');
  
    const tableDates = [tableDatesHeader, tableDatesSeparator, tableDatesRows].join('\n');
    output += tableDates + '\n\n';

    return output;
  }

  // Group results by useCase
  const groupedResults = results.reduce((acc, result) => {
    const useCase = result.useCase || 'Unknown';
    if (!acc[useCase]) {
      acc[useCase] = [];
    }
    acc[useCase].push(result);
    return acc;
  }, {});

  // Create a table for each use case
  Object.keys(groupedResults).forEach((useCase) => {
    output += `### Use Case ${useCase}\n\n`;
    const useCaseResults = groupedResults[useCase];
    output += generateTable(useCaseResults);
  });

  fs.writeFileSync(outputPath, output, 'utf8');

})();