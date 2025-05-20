const axios = require('axios');
const throat = require('throat');

const axiosThroatGet = throat(1, axios.get);

module.exports.getObservationCiedConnectivityResources = async () => {
  const data = await axiosThroatGet('http://hapi.fhir.org/baseR5/Observation?code=observation-cied-connectivity', {
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

module.exports.getDeviceResources = async (deviceId) => {
  const data = await axiosThroatGet(`http://hapi.fhir.org/baseR5/Device?_id=${deviceId}`, {
    headers: {
      'Accept': 'application/fhir+xml;q=1.0, application/fhir+json;q=1.0, application/xml+fhir;q=0.9, application/json+fhir;q=0.9',
      'User-Agent': 'Vector-Remote-Care/Node.js'
    }
  });
  
  return data.data.entry?.[0].resource;
};

module.exports.getPatientResources = async (patientId) => {
  const data = await axiosThroatGet(`http://hapi.fhir.org/baseR5/Patient?_id=${patientId}`, {
    headers: {
      'Accept': 'application/fhir+xml;q=1.0, application/fhir+json;q=1.0, application/xml+fhir;q=0.9, application/json+fhir;q=0.9',
      'User-Agent': 'Vector-Remote-Care/Node.js'
    }
  });
  
  return data.data.entry?.[0].resource;
};