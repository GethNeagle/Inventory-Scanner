const protocol = require("./protocol.js");

// Converts a jimp-like 32bpp image object to a DIB
module.exports.convertToDib = image => {
    if (!("bitmap" in image)) {
        return null;
    }

    const bitmap = image.bitmap;
    if (!("width" in bitmap) || !("height" in bitmap) || !("data" in bitmap)) {
        return null;
    }

    const dibHeader = new ArrayBuffer(40);
    let offset = 0;

    offset += protocol.write32(new DataView(dibHeader, offset), 40); // Size of header
    offset += protocol.write32(new DataView(dibHeader, offset), bitmap.width);  // Width
    offset += protocol.write32(new DataView(dibHeader, offset), -bitmap.height); // Height
    offset += protocol.write16(new DataView(dibHeader, offset), 1);  // Color Planes
    offset += protocol.write16(new DataView(dibHeader, offset), 32); // Color Depth
    offset += protocol.write32(new DataView(dibHeader, offset), 0);  // Compression Method (BI_RGB)
    offset += protocol.write32(new DataView(dibHeader, offset), bitmap.data.length); // Image size
    offset += protocol.write32(new DataView(dibHeader, offset), 0);  // Horizontal Resolution
    offset += protocol.write32(new DataView(dibHeader, offset), 0);  // Vertical Resolution
    offset += protocol.write32(new DataView(dibHeader, offset), 0);  // Palette Size
    offset += protocol.write32(new DataView(dibHeader, offset), 0);  // Ignored

    const dibBuffer = Buffer.alloc(40 + bitmap.data.length);
    Buffer.from(dibHeader).copy(dibBuffer);
    bitmap.data.copy(dibBuffer, 40);
    return dibBuffer;
}