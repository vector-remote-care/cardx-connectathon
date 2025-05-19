const axios = require('axios');

module.exports.getObservationCiedConnectivityResources = async () => {
  const data = await axios.get('http://hapi.fhir.org/baseR5/Observation?code=observation-cied-connectivity', {
    headers: {
      'Accept': 'application/fhir+xml;q=1.0, application/fhir+json;q=1.0, application/xml+fhir;q=0.9, application/json+fhir;q=0.9',
      'User-Agent': 'Vector-Remote-Care/Node.js'
    }
  });

  if(data.data.total === 0) {
    return [];
  }

  return data.data.entry.map((entry) => entry.resource);
};