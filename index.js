const fs = require("fs");

exports.readInfoHeader = function (infoFile) {
  const info = fs.readFileSync(infoFile, "utf8").replace(/\r/g, "").split("\n");
  let headerInfo = {};

  info.forEach((line) => {
    //Date
    if (line.startsWith(`File.DateLocal`)){
      headerInfo[`Date`] = line.split("= ")[1];
    }
    else if(line.startsWith(`Testrun =`)){
      headerInfo[`Testrun`] = line.split("= ")[1];
    }
    else if(line.startsWith(`CarMaker.Version =`)){
      headerInfo[`CM_Version`] = line.split("= ")[1];
    }
  });
  return headerInfo;

}
exports.readInfoQuants = function (infoFile) {
  const info = fs.readFileSync(infoFile, "utf8").replace(/\r/g, "").split("\n");

  // extract quantity info
  let quantNumber = 1;
  let lastQuantName = "";
  let quants = [];
  info.forEach((line) => {
    // name
    if (line.startsWith(`File.At.${quantNumber}.Name`)) {
      lastQuantName = line.split("= ")[1];
      quants.push({ name: lastQuantName, type: "", unit: "", values: [] });
      quantNumber++;
      return;
    }

    // type
    if (line.startsWith(`File.At.${quantNumber - 1}.Type`)) {
      quants[quants.length - 1].type = line.split("= ")[1];
      return;
    }

    // unit
    if (line.startsWith(`Quantity.${lastQuantName}.Unit`)) {
      quants[quants.length - 1].unit = line.split("= ")[1];
      return;
    }
  });
  return quants;
}
// read erg and info file
exports.read = function (ergFile, infoFile) {
  // read info file
  let quants = exports.readInfoQuants(infoFile);

  // read erg file
  let ergBuffer = fs.readFileSync(ergFile);

  // process erg header
  let headerBuffer = ergBuffer.slice(0, 15);
  let ergHeader = {
    format: headerBuffer.toString("ascii", 0, 7),
    version: headerBuffer.readUInt8(8),
    byteOrder: headerBuffer.readUInt8(9),
    recordSize: headerBuffer.readUInt8(10, 11),
    reserved: headerBuffer.readUInt8(12, 15),
  };

  // process erg records by reading value for each quantity
  let recordBuffer = ergBuffer.slice(16);
  let recordIndex = 0;
  while (recordIndex < recordBuffer.length) {
    quants.forEach((quant) => {
      switch (quant.type) {
        case "Double": {
          let value =
            ergHeader.byteOrder == 0
              ? recordBuffer.readDoubleLE(recordIndex)
              : recordBuffer.readDoubleBE(recordIndex);
          quant.values.push(value);
          recordIndex += 8;
          break;
        }
        case "Float": {
          let value =
            ergHeader.byteOrder == 0
              ? recordBuffer.readFloatLE(recordIndex)
              : recordBuffer.readFloatBE(recordIndex);
          quant.values.push(value);
          recordIndex += 4;
          break;
        }
        case "LongLong": {
          let value =
            ergHeader.byteOrder == 0
              ? recordBuffer.readIntLE(recordIndex, 8)
              : recordBuffer.readIntBE(recordIndex, 8);
          quant.values.push(value);
          recordIndex += 8;
          break;
        }
        case "ULongLong": {
          let value =
            ergHeader.byteOrder == 0
              ? recordBuffer.readUIntLE(recordIndex, 8)
              : recordBuffer.readUIntBE(recordIndex, 8);
          quant.values.push(value);
          recordIndex += 8;
          break;
        }
        case "Long": {
          let value =
            ergHeader.byteOrder == 0
              ? recordBuffer.readIntLE(recordIndex, 4)
              : recordBuffer.readIntBE(recordIndex, 4);
          quant.values.push(value);
          recordIndex += 4;
          break;
        }
        case "ULong": {
          let value =
            ergHeader.byteOrder == 0
              ? recordBuffer.readUIntLE(recordIndex, 4)
              : recordBuffer.readUIntBE(recordIndex, 4);
          quant.values.push(value);
          recordIndex += 4;
          break;
        }
        case "Int": {
          let value =
            ergHeader.byteOrder == 0
              ? recordBuffer.readIntLE(recordIndex, 4)
              : recordBuffer.readIntBE(recordIndex, 4);
          quant.values.push(value);
          recordIndex += 4;
          break;
        }
        case "UInt": {
          let value =
            ergHeader.byteOrder == 0
              ? recordBuffer.readUIntLE(recordIndex, 4)
              : recordBuffer.readUIntBE(recordIndex, 4);
          quant.values.push(value);
          recordIndex += 4;
          break;
        }
        case "Short": {
          let value =
            ergHeader.byteOrder == 0
              ? recordBuffer.readIntLE(recordIndex, 2)
              : recordBuffer.readIntBE(recordIndex, 2);
          quant.values.push(value);
          recordIndex += 4;
          break;
        }
        case "UShort": {
          let value =
            ergHeader.byteOrder == 0
              ? recordBuffer.readUIntLE(recordIndex, 2)
              : recordBuffer.readUIntBE(recordIndex, 2);
          quant.values.push(value);
          recordIndex += 4;
          break;
        }
        case "Char": {
          let value =
            ergHeader.byteOrder == 0
              ? recordBuffer.readIntLE(recordIndex, 1)
              : recordBuffer.readIntBE(recordIndex, 1);
          quant.values.push(value.toString());
          recordIndex += 1;
          break;
        }
        case "UChar": {
          let value =
            ergHeader.byteOrder == 0
              ? recordBuffer.readUIntLE(recordIndex, 1)
              : recordBuffer.readUIntBE(recordIndex, 1);
          quant.values.push(value.toString());
          recordIndex += 1;
          break;
        }
        default: {
          if (quant.type.endsWith("Bytes")) {
            let skipBytes = parseInt(quant.type.split(" Bytes")[0]);
            recordIndex += skipBytes;
          }
          break;
        }
      }
    });
  }
  return quants;
};
