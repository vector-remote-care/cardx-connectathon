const {getObservationCiedConnectivityResources} = require('../src/fetch.js');
const {parseResource, parseMap} = require('../src/parse.js');

(async () => {
  // fetch the data from HAPI FHIR test server
  const data = await getObservationCiedConnectivityResources();
  // Parse using provided FHIR Paths (https://confluence.hl7.org/spaces/COD/pages/345541798/FHIRPath)
  const results = data.map(parseResource);

  // output as json or csv
  const outputFormat = process.argv[2] === 'csv' ? 'csv' : 'json';

  // output as csv
  if(outputFormat === 'csv') {
    const csvHeader = Object.keys(parseMap);
    const csvRows = results.map((result) => Object.values(result).map((value) => `"${value}"`).join(','));
    const csv = [csvHeader.join(','), ...csvRows].join('\n');
    console.log(csv);
  } else {
    // output as json
    console.log(JSON.stringify(results, null, 2));  
  }
})();