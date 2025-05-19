# CardX Connectathon for CIED Patient Connectivity
The following table is generated using fetched data from observations on the FHIR test server: http://hapi.fhir.org/baseR5/


## Cied Connectivity Observations

| patient | device | Status |   | note |
| --- | --- | --- | --- | --- |
| BIOcase1Patient | BIOcase1Cied | **connected** |  | Case 1: Setup after monitor replacement not complete |
| BIOcase2Patient | BIOcase2Cied | $${\color{red}disconnected}$$ | inactive | Case 2: Patient is inactive due to lack of connectivity |
| uc1ACMEPatient | uc1ACMEICD | $${\color{red}disconnected}$$ | setup-not-completed | The patient does not have an active monitor. |
| 798106 | 798108 | **connected** |  |  |
| 798110 | 798111 | $${\color{red}disconnected}$$ | setup-not-completed | Case 1: Patient receives a new monitor that has not been setup |
| uc2ACMEPatient | uc2ACMEICD | $${\color{red}disconnected}$$ | inactive | The patient has been disconnected for more than 90 days and is listed as inactive. |
| 798118 | 798119 | $${\color{red}disconnected}$$ | inactive | Case 2: Patient is inactive due to lack of connectivity. |

