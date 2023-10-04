import fs from "fs";

/**
 * Validates a CarMaker erg Infofile
 * @param infoFile Path to CarMaker erg InfoFile
 * @returns true if valid erg infofile, false if invalid
 */
function validateInfoHeader(infoFile: string) {
  // read infofile
  const info: string[] = fs
    .readFileSync(infoFile, "utf8")
    .replace(/\r/g, "")
    .split("\n");

  let validFormat = false;
  let validInfofile = false;

  // check that first line of infofile is valid
  if (info[0].startsWith("#INFOFILE1.1")) {
    validInfofile = true;
  }

  // Check that file format is erg
  for (const line of info) {
    if (line.startsWith("File.Format") && line.includes("erg")) {
      validFormat = true;
      break;
    }
  }

  return validFormat && validInfofile;
}

/**
 * Read the erg infofile header.
 * @param infoFile Path to CarMaker erg InfoFile.
 * @returns Object containing erg file metadata.
 */
function readInfoHeader(infoFile: string) {
  // read the info file
  const info: string[] = fs
    .readFileSync(infoFile, "utf8")
    .replace(/\r/g, "")
    .split("\n");
  let headerInfo: {
    Date?: string;
    Testrun?: string;
    CM_Version?: string;
  } = {};

  // extract header info
  info.forEach((line) => {
    if (line.startsWith(`File.DateLocal`)) {
      // date
      headerInfo[`Date`] = line.split("= ")[1];
    } else if (line.startsWith(`Testrun =`)) {
      // test run
      headerInfo[`Testrun`] = line.split("= ")[1];
    } else if (line.startsWith(`CarMaker.Version =`)) {
      // carmaker version
      headerInfo[`CM_Version`] = line.split("= ")[1];
    }
  });
  return headerInfo;
}

/**
 * Read list of quantities from erg infofile.
 * @param infoFile Path to CarMaker erg InfoFile.
 * @returns Array of objects containing erg file quantity names.
 */
function readInfoQuants(infoFile: string) {
  // read the info file
  const info: string[] = fs
    .readFileSync(infoFile, "utf8")
    .replace(/\r/g, "")
    .split("\n");

  // extract quantity info
  let quantNumber = 1;
  let lastQuantName = "";
  let quants: {
    name: string;
    type: string;
    unit: string;
    values: (string | number)[];
  }[] = [];
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
/**
 *  Read erg and info file and return data values for each quantity.
 * @param ergFile Path to CarMaker erg file.
 * @param infoFile Path to CarMaker erg InfoFile.
 * @returns Array of CarMaker quantities
 */
function read(ergFile: string, infoFile: string) {
  // read info file
  let quants = readInfoQuants(infoFile);

  // error if there are no quantities in erg infofile
  if (quants.length < 1) {
    throw new Error("ERG File does not contain any quantities");
  }

  // read erg file
  let ergBuffer = fs.readFileSync(ergFile);

  // process erg header
  let headerBuffer = ergBuffer.slice(0, 15);
  let ergHeader = {
    format: headerBuffer.toString("ascii", 0, 7),
    version: headerBuffer.readUInt8(8),
    byteOrder: headerBuffer.readUInt8(9),
  };

  // Check format specified in the ERG header. Error if not ERG
  if (!ergHeader.format.startsWith("CM-ERG")) {
    throw new Error("Invalid ERG file");
  }

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
}

export { read, readInfoHeader, readInfoQuants, validateInfoHeader };
export default { read, readInfoHeader, readInfoQuants, validateInfoHeader };
