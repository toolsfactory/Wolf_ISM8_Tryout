"use strict";
// tslint:disable:typedef
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
var HOST = "192.168.2.120";
var PORT = 12004;
var buff_req = new Buffer("0620F080001104000000F086006E000000", "hex");
var buff_getall = new Buffer("0620F080001604000000F0D0", "hex");
var dec = new (require("./js/decoder.js"))();
var enc = new (require("./js/encoder.js"))();
var datapoints = require("./js/datapoints.json");
function getDevice(dp) {
    if (dp >= 1 && dp <= 13) {
        return "hg1";
    }
    else if (dp >= 14 && dp <= 26) {
        return "hg2";
    }
    else if (dp >= 27 && dp <= 39) {
        return "hg3";
    }
    else if (dp >= 40 && dp <= 52) {
        return "hg4";
    }
    else if (dp >= 53 && dp <= 66) {
        return "bm1";
    }
    else if (dp >= 67 && dp <= 79) {
        return "bm2";
    }
    else if (dp >= 80 && dp <= 92) {
        return "bm3";
    }
    else if (dp >= 93 && dp <= 105) {
        return "bm4";
    }
    else if (dp >= 106 && dp <= 113) {
        return "km1";
    }
    else if (dp >= 114 && dp <= 120) {
        return "mm1";
    }
    else if (dp >= 121 && dp <= 127) {
        return "mm2";
    }
    else if (dp >= 128 && dp <= 134) {
        return "mm3";
    }
    else if (dp >= 135 && dp <= 147) {
        return "sm1";
    }
    else if (dp >= 148 && dp <= 175) {
        return "cwl";
    }
    else if (dp >= 176 && dp <= 191) {
        return "hg0";
    }
    else if (dp >= 192 && dp <= 193) {
        return "cwl";
    }
    else if (dp === 194) {
        return "sys";
    }
    else if (dp >= 195 && dp <= 196) {
        return "sm1";
    }
    else if (dp >= 197 && dp <= 199) {
        return "hg0";
    }
    else if (dp >= 200 && dp <= 202) {
        return "hg1";
    }
    else if (dp >= 203 && dp <= 205) {
        return "hg2";
    }
    else if (dp >= 206 && dp <= 208) {
        return "hg3";
    }
    else if (dp >= 209 && dp <= 210) {
        return "km1";
    }
    else {
        return "Unknown";
    }
}
function decode(type, data, dp) {
    var val;
    var _data;
    if (type === "DPT_Switch") {
        val = data.readInt8(0);
        if (val === 0) {
            return "Off";
        }
        else {
            return "On";
        }
    }
    else if (type === "DPT_Bool") {
        val = data.readInt8(0);
        if (val === 0) {
            return "false";
        }
        else {
            return "true";
        }
    }
    else if (type === "DPT_Enable") {
        val = data.readInt8(0);
        if (val === 0) {
            return "Disable";
        }
        else {
            return "Enable";
        }
    }
    else if (type === "DPT_OpenClose") {
        val = data.readInt8(0);
        if (val === 0) {
            return "Close";
        }
        else {
            return "Open";
        }
    }
    else if (type === "DPT_Scaling") {
        return Math.round(parseInt(dec.decodeDPT5(data), 10) * 0.4);
    }
    else if (type === "DPT_Value_Temp" || type === "DPT_Tempd" ||
        type === "DPT_Value_Pres" || type === "DPT_Power" || type === "DPT_Value_Volume_Flow") {
        if (type === "DPT_Value_Pres") {
            return Math.round((dec.decodeDPT9(data) / 100000) * 100) / 100;
        }
        else {
            return Math.round(dec.decodeDPT9(data) * 100) / 100;
        }
    }
    else if (type === "DPT_TimeOfDay") {
        return dec.decodeDPT10(data);
    }
    else if (type === "DPT_Date") {
        return dec.decodeDPT11(data);
    }
    else if (type === "DPT_FlowRate_m3/h" || type === "DPT_ActiveEnergy" || type === "DPT_ActiveEnergy_kWh") {
        return dec.decodeDPT13(data);
    }
    else if (type === "DPT_DHWMode") {
        _data = data.readInt8(0);
        if (datapoints[dp].name === "Programmwahl Warmwasser") {
            if (_data === 0) {
                return "Automatikbetrieb";
            }
            else if (_data === 2) {
                return "Dauerbetrieb";
            }
            else if (_data === 4) {
                return "Standby";
            }
            else {
                throw "";
            }
        }
        else if (datapoints[dp].name === "Programmwahl CWL") {
            if (_data === 0) {
                return "Automatikbetrieb";
            }
            else if (_data === 1) {
                return "Nennlüftung";
            }
            else if (_data === 3) {
                return "Reduzierte Lüftung";
            }
            else {
                throw "";
            }
        }
        else {
            throw "";
        }
    }
    else if (type === "DPT_HVACMode") {
        _data = data.readInt8(0);
        if (datapoints[dp].name === "Programmwahl Heizkreis" || datapoints[dp].name === "Programmwahl Mischer") {
            if (_data === 2) {
                return "Standby";
            }
            else if (_data === 0) {
                return "Automatikbetrieb";
            }
            else if (_data === 1) {
                return "Heizbetrieb";
            }
            else if (_data === 3) {
                return "Sparbetrieb";
            }
            else {
                throw "";
            }
        }
        else {
            throw "";
        }
    }
    else if (type === "DPT_HVACContrMode") {
        _data = data.readInt8(0);
        if (dp < 177) {
            if (_data === 0) {
                return "Auto";
            }
            else if (_data === 1) {
                return "Heat";
            }
            else if (_data === 6) {
                return "Off";
            }
            else if (_data === 7) {
                return "Test";
            }
            else if (_data === 11) {
                return "Ice";
            }
            else if (_data === 15) {
                return "calibrations Mode";
            }
            else {
                throw "";
            }
        }
        else {
            if (_data === 0) {
                return "Auto";
            }
            else if (_data === 1) {
                return "Heat";
            }
            else if (_data === 3) {
                return "Cool";
            }
            else if (_data === 6) {
                return "Off";
            }
            else if (_data === 7) {
                return "Test";
            }
            else if (_data === 11) {
                return "Ice";
            }
            else {
                throw "";
            }
        }
    }
    else {
        throw "";
    }
}
function sendResponse(frame, sock) {
    buff_req[12] = frame[12];
    buff_req[13] = frame[13];
    sock.write(buff_req);
}
function logFrame(frame) {
    const dp = frame.readUInt16BE(12);
    if (dp > 210) {
        console.log("Unknown DP: " + dp +
            "\n Data: " + frame.toString("hex") +
            "\n Lengh: " + frame.length);
    }
    else {
        const device = getDevice(dp);
        var val = decode(datapoints[dp].type, frame.slice(20), dp);
        console.log("incomming" +
            "\n Device: " + device +
            "\n Datapoint: " + dp +
            "\n Datapoint_name: " + datapoints[dp].name +
            "\n Datapoint_type: " + datapoints[dp].type +
            "\n Data: " + frame.toString("hex") +
            "\n Lengh: " + frame.length +
            "\n Value: " + val +
            "\n -----");
    }
}
net.createServer(function (sock) {
    var buffer = Buffer.allocUnsafe(0);
    console.log("CONNECTED: " + sock.remoteAddress + ":" + sock.remotePort);
    sock.on("data", function (_data) {
        console.log("---------------");
        buffer = Buffer.concat([buffer, _data]);
        while (buffer.byteLength > 12 && buffer[0] === 0x06 && buffer[1] === 0x20 && buffer[2] === 0xf0 && buffer[3] === 0x80) {
            const frameLength = buffer.readUInt16BE(4);
            const frame = Buffer.allocUnsafeSlow(frameLength);
            buffer.copy(frame, 0, 0, frameLength);
            if (frameLength === buffer.byteLength) {
                buffer = Buffer.allocUnsafe(0);
            }
            else {
                var nb = Buffer.alloc(buffer.length - frameLength, 0);
                var len = buffer.copy(nb, 0, frameLength);
                buffer = nb;
            }
            sendResponse(frame, sock);
            logFrame(frame);
        }
    });
    sock.write(buff_getall);
    console.log("Wrote send all");
}).listen(PORT, HOST);
console.log("Server listening on " + HOST + ":" + PORT);
//# sourceMappingURL=main.js.map