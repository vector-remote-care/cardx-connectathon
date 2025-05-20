const fhirpath = require('fhirpath');
const fhirpathR5Model = require('fhirpath/fhir-context/r5');
const pipe = module.exports.pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const fhr = (path) => fhirpath.compile(path, fhirpathR5Model);
const first = (arr) => arr.length > 0 ? arr[0] : null;

// FHIR Paths can be referenced here: https://confluence.hl7.org/spaces/COD/pages/345541798/FHIRPath
const parseMap = module.exports.parseMap = {
  patient:                              pipe(fhr("subject.reference"), first, (str) => str.split("/").pop()),
  device:                               pipe(fhr("device.reference"), first, (str) => str.split("/").pop()),
  effective:                            pipe(fhr("effectiveDateTime"), first, Date.parse),
  connectivityStatus:                   pipe(fhr("component.where(code.coding.code='connectivity-status').valueCodeableConcept.coding.code"), first),
  connectivityModifier:                 pipe(fhr("component.where(code.coding.code='connectivity-modifier').valueCodeableConcept.coding.code"), first),
  note:                                 pipe(fhr("note.text"), first),
  lastCiedConnectivityDate:             pipe(fhr("component.where(code.coding.code='last-cied-connectivity-time').valueDateTime"), first, Date.parse),
  lastMonitorConnectivityDate:          pipe(fhr("component.where(code.coding.code='last-monitor-connectivity-time').valueDateTime"), first, Date.parse),
  nextCiedConnectivityDate:             pipe(fhr("component.where(code.coding.code='next-cied-connectivity-date').valueDateTime"), first, Date.parse),
  nextMonitorConnectivityDate:          pipe(fhr("component.where(code.coding.code='next-monitor-connectivity-date').valueDateTime"), first, Date.parse),
  lastRemoteInterrogationDate:          pipe(fhr("component.where(code.coding.code='last-interrogation-date').valueDateTime"), first, Date.parse),
  nextScheduledRemoteInterrogationDate: pipe(fhr("component.where(code.coding.code='next-interrogation-date').valueDateTime"), first, Date.parse),
};

// Takes a resource and parses it using the parseMap
// Returns an object with the keys from parseMap and the values from the resource
const parseResource = module.exports.parseResource = (resource) => Object.fromEntries(Object.entries(parseMap).map(([key, parse]) => [
  key,
  parse(resource)
]));

const numDays = (ms) => Math.round(ms / (1000 * 60 * 60 * 24));


// Updates Dates to be relative number of days from effective date
const deltaIfyDates = module.exports.deltaIfyDates = (resource) => ({
  ...resource,
  lastCiedConnectivityDate: numDays(resource.lastCiedConnectivityDate - resource.effective),
  lastMonitorConnectivityDate: numDays(resource.lastMonitorConnectivityDate - resource.effective),
  nextCiedConnectivityDate: numDays(resource.nextCiedConnectivityDate - resource.effective),
  nextMonitorConnectivityDate: numDays(resource.nextMonitorConnectivityDate - resource.effective),
  lastRemoteInterrogationDate: numDays(resource.lastRemoteInterrogationDate - resource.effective),
  nextScheduledRemoteInterrogationDate: numDays(resource.nextScheduledRemoteInterrogationDate - resource.effective),
});

const determineUseCaseNum = (resource) => {
  // Check notes
  const caseNum = resource.note?.match(/^Case (\d+)\b/)?.[1];
  if (caseNum) {
    return parseInt(caseNum);
  }
  // Check patient id if it stats with uc\d or uc\d+
  const patientId = resource.patient;
  if (patientId && patientId.match(/^ucX?\d+/)) {
    return parseInt(patientId.match(/^ucX?(\d+)/)?.[1]);
  }
}

const useCaseMfg = module.exports.useCaseMfg = (resource) => ({
  ...resource,
  useCase: determineUseCaseNum(resource),
});