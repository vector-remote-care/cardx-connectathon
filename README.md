# CardX Connectathon for CIED Patient Connectivity
The following table is generated using fetched data from observations on the FHIR test server: http://hapi.fhir.org/baseR5/


## Cied Connectivity Observations

| patient | device | manufacturer | serialNumber | modelNumber | note | Status |   |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BIOcase1Patient | BIOcase1Cied | Biotronik SE & Co KG | 1234567891 | Rivacor 7 DR-T | Case 1: Setup after monitor replacement not complete | **connected** |  |
| BIOcase2Patient | BIOcase2Cied | Biotronik SE & Co KG | 1234567892 | Rivacor 7 DR-T | Case 2: Patient is inactive due to lack of connectivity | $${\color{red}disconnected}$$ | inactive |
| uc1ACMEPatient | uc1ACMEICD | ACME Devices | 123456789 | ICDExample1 | The patient does not have an active monitor. | $${\color{red}disconnected}$$ | setup-not-completed |
| 798106 | 798108 | CIED Manufacturer X | 11111111 | XXX11 |  | **connected** |  |
| 798110 | 798111 | St.Jude Medical | 1309243 | Aveir LP LSP202V | Case 1: Patient receives a new monitor that has not been setup | $${\color{red}disconnected}$$ | setup-not-completed |
| uc2ACMEPatient | uc2ACMEICD | ACME Devices | 123456789 | ICDExample2 | The patient has been disconnected for more than 90 days and is listed as inactive. | $${\color{red}disconnected}$$ | inactive |
| 798118 | 798119 | St.Jude Medical | 1309243 | Aveir LP LSP202V | Case 2: Patient is inactive due to lack of connectivity. | $${\color{red}disconnected}$$ | inactive |

