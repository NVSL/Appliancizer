const linuxduino = require('linuxduino');
var Wire = null;

const MCP9808_REG_AMBIENT_TEMP = 0x05; ///< ambient temperature
const MCP9808_REG_MANUF_ID = 0x06;     ///< manufacture ID
const MCP9808_REG_DEVICE_ID =  0x07;    ///< device ID

function read16(reg, i2cAddr) {
  let val = 0xFFFF;
  let state;

  if (Wire == null) {
    console.error("Wire not initialized yet")
    return val;
  }

  Wire.beginTransmission(i2cAddr);
  Wire.write_byte(reg);
  state = Wire.endTransmission();

  if (state != 0) {
    Wire.requestFrom(i2cAddr, 2);
    val = Wire.read();
    val <<= 8;
    val |= Wire.read();
  }

  return val;
}

function readTempC(i2cAddr) {
  let temp = NaN;
  let t = read16(MCP9808_REG_AMBIENT_TEMP, i2cAddr);

  if (t != 0xFFFF) {
    temp = t & 0x0FFF;
    temp /= 16.0;
    if (t & 0x1000)
      temp -= 256;
  }

  return temp;
}

function readTempF(i2cAddr) {
  let temp = NaN;
  let t = read16(MCP9808_REG_AMBIENT_TEMP, i2cAddr);

  if (t != 0xFFFF) {
    temp = t & 0x0FFF;
    temp /= 16.0;
    if (t & 0x1000)
      temp -= 256;

    temp = temp * 9.0 / 5.0 + 32;
  }

  return temp;
}

function initMCP9808(i2cPort, i2cAddr) {

  Wire = new linuxduino.Wire();
  Wire.begin(i2cPort);

  if (read16(MCP9808_REG_MANUF_ID, i2cAddr) != 0x0054)
    return false;
  if (read16(MCP9808_REG_DEVICE_ID, i2cAddr) != 0x0400)
    return false;

  return true;
}


module.exports.initMCP9808 = initMCP9808;
module.exports.readTempF = readTempF;
module.exports.readTempC = readTempC;