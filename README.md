# IPG Automotive erg file reader

JavaScript file reader for IPG Automotive .erg result files. The reader requires a .erg file and corresponding .info file.

The data is returned as an array of quantity objects. Each object represents a quantity and contains the following properties:

- name - the name of the quantity e.g. 'Car.Distance'
- type - the data type of the quantity e.g. 'Double'
- unit - the unit of the quantity e.g. 'm'
- values - array of values for the quantity e.g. [0, 1, 2, 3]

Further information on the erg file format can be found in appendix A.1 of the IPG Automotive reference manual.

## Install

```
npm install --save @ipguk/erg-file-reader
```

## Usage

Import library

```
const erg = require("@ipguk/erg-file-reader");
```

Define the .erg and .info file paths

```
let ergFile = "MyFile.erg";
let infoFile = "MyFile.erg.info";
```

Read the data

```
let data = erg.read(ergFile, infoFile);
```
Read Quantity definitions from InfoFile

```
let data = erg.readInfoQuants(infoFile);
```
Read Header/Infos (Date, Testrun Name, CarMaker Version) from InfoFole

```
let data = erg.readInfoHeader(infoFile);
```