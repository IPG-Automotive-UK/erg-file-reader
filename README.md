# IPG Automotive erg file reader

This is a JavaScript file importer for IPG Automotive .erg result files. The importer requires a .erg file and corresponding .info file.

The data is returned as an array of quantity objects. Each object represents a quantity and contains the following properties:

- name: the name of the quantity
- type: the data type of the quantity
- unit: the unit of the quantity
- values: array of values for the quantity

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
