var util = require("util");

/////////////////////////////////////////////////////

// Cf. properties.h
const PropertyType = {
    NONE: 0,
    STRING: 1,
    INTEGER: 2,
    BOOLEAN: 3,
}

const writeBytes = (view, bytes) => {
    let offset = 0;
    offset += write32(view, bytes.length);
    bytes.forEach(b => {
        view.setUint8(offset, b);
        offset += 1;
    });

    return offset;
}

const write8 = (view, value) => {
    view.setUint8(0, value, true);
    return 1;
}

const write16 = (view, value) => {
    view.setUint16(0, value, true);
    return 2;
}

const write32 = (view, value) => {
    view.setUint32(0, value, true);
    return 4;
}

const writeVariable = (stream, key, value, allowRecurse) => {
    const enc = new util.TextEncoder("utf-8");
    const keyBytes = enc.encode(key);

    if (Array.isArray(value)) {
        if (!allowRecurse) {
            return;
        }

        value.forEach((subValue, index) => {
            writeVariable(stream, key + "[" + index + "]", subValue, false);
        });

        return;
    }

    if (typeof value === "string" || Buffer.isBuffer(value)) {
        const valueBytes = (Buffer.isBuffer(value)) ? value : Buffer.from(enc.encode(value.toString()).buffer);
        const size = 1 + 4 + keyBytes.length + 4;
        const buffer = new ArrayBuffer(size);

        let offset = 0;
        offset += write8(new DataView(buffer, offset), PropertyType.STRING);
        offset += writeBytes(new DataView(buffer, offset), keyBytes);
        offset += write32(new DataView(buffer, offset), valueBytes.length);
        stream.write(Buffer.from(buffer));
        stream.write(valueBytes);
        return;
    }

    if (typeof value === "number") {
        const size = 1 + 4 + keyBytes.length + 4;
        const buffer = new ArrayBuffer(size);

        let offset = 0;
        offset += write8(new DataView(buffer, offset), PropertyType.INTEGER);
        offset += writeBytes(new DataView(buffer, offset), keyBytes);
        offset += write32(new DataView(buffer, offset), Number.parseInt(value));
        stream.write(Buffer.from(buffer));
        return;
    }

    if (typeof value === "boolean") {
        const size = 1 + 4 + keyBytes.length + 1;
        const buffer = new ArrayBuffer(size);

        let offset = 0;
        offset += write8(new DataView(buffer, offset), PropertyType.BOOLEAN);
        offset += writeBytes(new DataView(buffer, offset), keyBytes);
        offset += write8(new DataView(buffer, offset), value ? 1 : 0);
        stream.write(Buffer.from(buffer));
        return;
    }

    if (typeof value === "object") {
        if (!allowRecurse) {
            return;
        }

        for (let [subKey, subValue] of Object.entries(value)) {
            writeVariable(stream, key + "." + subKey, subValue, false);
        }

        return;
    }
}

/////////////////////////////////////////////////////

const streamWrite8 = (stream, value) => {
    var buffer = new ArrayBuffer(4);
    write32(new DataView(buffer), value);
    stream.write(Buffer.from(buffer));
}

/////////////////////////////////////////////////////

const sendAnalyzeRequest = (stream, params) => {
    for (let [key, value] of Object.entries(params)) {
        writeVariable(stream, key, value, true);
    }
    streamWrite8(stream, 0);
}

module.exports.sendAnalyzeRequest = sendAnalyzeRequest;
module.exports.write8 = write8;
module.exports.write16 = write16;
module.exports.write32 = write32;
