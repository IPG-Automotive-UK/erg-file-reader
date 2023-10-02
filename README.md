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

Read the data for all quantities

```
let data = erg.read(ergFile, infoFile);
```

Read quantity definitions - no data values are returned, just the name and unit of each quantity

```
let quants = erg.readInfoQuants(infoFile);
```

Read header information - Date, Testrun Name, CarMaker Version

```
let header = erg.readInfoHeader(infoFile);
```

Validate ERG InfoFile

```
if(erg.validateInfoHeader(infoFile)){
    console.log("Valid ERG InfoFile);
}
else{
    console.log("Invalid ERG InfoFile);
}
```
