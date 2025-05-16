const fhirpath = require('fhirpath');
const fhirpathR5Model = require('fhirpath/fhir-context/r5');
const pipe = module.exports.pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const fhr = (path) => fhirpath.compile(path, fhirpathR5Model);
const first = (arr) => arr.length > 0 ? arr[0] : null;

// FHIR Paths can be referenced here: https://confluence.hl7.org/spaces/COD/pages/345541798/FHIRPath
const parseMap = module.exports.parseMap = {
  patient:                              pipe(fhr("subject.reference"), first),
  effective:                            pipe(fhr("effectiveDateTime"), first),
  note:                                 pipe(fhr("note.text"), first),
  device:                               pipe(fhr("device.reference"), first),
  connectivityStatus:                   pipe(fhr("component.where(code.coding.code='connectivity-status').valueCodeableConcept.coding.code"), first),
  connectivityModifier:                 pipe(fhr("component.where(code.coding.code='connectivity-modifier').valueCodeableConcept.coding.code"), first),
  lastCiedConnectivityDate:             pipe(fhr("component.where(code.coding.code='last-cied-connectivity-time').valueDateTime"), first),
  lastMonitorConnectivityDate:          pipe(fhr("component.where(code.coding.code='last-monitor-connectivity-time').valueDateTime"), first),
  nextCiedConnectivityDate:             pipe(fhr("component.where(code.coding.code='next-cied-connectivity-date').valueDateTime"), first),
  nextMonitorConnectivityDate:          pipe(fhr("component.where(code.coding.code='next-monitor-connectivity-date').valueDateTime"), first),
  lastRemoteInterrogationDate:          pipe(fhr("component.where(code.coding.code='last-interrogation-date').valueDateTime"), first),
  nextScheduledRemoteInterrogationDate: pipe(fhr("component.where(code.coding.code='next-interrogation-date').valueDateTime"), first),
};

// Takes a resource and parses it using the parseMap
// Returns an object with the keys from parseMap and the values from the resource
const parseResource = module.exports.parseResource = (resource) => Object.fromEntries(Object.entries(parseMap).map(([key, parse]) => [
  key,
  parse(resource)
]));