module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(737);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 16:
/***/ (function(module) {

module.exports = require("tls");

/***/ }),

/***/ 87:
/***/ (function(module) {

module.exports = require("os");

/***/ }),

/***/ 103:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const FileInfo_1 = __webpack_require__(392);
/**
 * This parser is based on the FTP client library source code in Apache Commons Net provided
 * under the Apache 2.0 license. It has been simplified and rewritten to better fit the Javascript language.
 *
 * https://github.com/apache/commons-net/blob/master/src/main/java/org/apache/commons/net/ftp/parser/NTFTPEntryParser.java
 */
const RE_LINE = new RegExp("(\\S+)\\s+(\\S+)\\s+" // MM-dd-yy whitespace hh:mma|kk:mm swallow trailing spaces
    + "(?:(<DIR>)|([0-9]+))\\s+" // <DIR> or ddddd swallow trailing spaces
    + "(\\S.*)" // First non-space followed by rest of line (name)
);
/**
 * Returns true if a given line might be a DOS-style listing.
 *
 * - Example: `12-05-96  05:03PM       <DIR>          myDir`
 */
function testLine(line) {
    return /^\d{2}/.test(line) && RE_LINE.test(line);
}
exports.testLine = testLine;
/**
 * Parse a single line of a DOS-style directory listing.
 */
function parseLine(line) {
    const groups = line.match(RE_LINE);
    if (groups === null) {
        return undefined;
    }
    const name = groups[5];
    if (name === "." || name === "..") { // Ignore parent directory links
        return undefined;
    }
    const file = new FileInfo_1.FileInfo(name);
    const fileType = groups[3];
    if (fileType === "<DIR>") {
        file.type = FileInfo_1.FileType.Directory;
        file.size = 0;
    }
    else {
        file.type = FileInfo_1.FileType.File;
        file.size = parseInt(groups[4], 10);
    }
    file.rawModifiedAt = groups[1] + " " + groups[2];
    return file;
}
exports.parseLine = parseLine;
function transformList(files) {
    return files;
}
exports.transformList = transformList;


/***/ }),

/***/ 156:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = __webpack_require__(413);
class StringWriter extends stream_1.Writable {
    constructor() {
        super(...arguments);
        this.buf = Buffer.alloc(0);
    }
    _write(chunk, _, callback) {
        if (chunk instanceof Buffer) {
            this.buf = Buffer.concat([this.buf, chunk]);
            callback(null);
        }
        else {
            callback(new Error("StringWriter expects chunks of type 'Buffer'."));
        }
    }
    getText(encoding) {
        return this.buf.toString(encoding);
    }
}
exports.StringWriter = StringWriter;


/***/ }),

/***/ 362:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(__webpack_require__(87));
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
function escapeData(s) {
    return toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 387:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const FileInfo_1 = __webpack_require__(392);
const JA_MONTH = "\u6708";
const JA_DAY = "\u65e5";
const JA_YEAR = "\u5e74";
/**
 * This parser is based on the FTP client library source code in Apache Commons Net provided
 * under the Apache 2.0 license. It has been simplified and rewritten to better fit the Javascript language.
 *
 * https://github.com/apache/commons-net/blob/master/src/main/java/org/apache/commons/net/ftp/parser/UnixFTPEntryParser.java
 *
 * Below is the regular expression used by this parser.
 *
 * Permissions:
 *    r   the file is readable
 *    w   the file is writable
 *    x   the file is executable
 *    -   the indicated permission is not granted
 *    L   mandatory locking occurs during access (the set-group-ID bit is
 *        on and the group execution bit is off)
 *    s   the set-user-ID or set-group-ID bit is on, and the corresponding
 *        user or group execution bit is also on
 *    S   undefined bit-state (the set-user-ID bit is on and the user
 *        execution bit is off)
 *    t   the 1000 (octal) bit, or sticky bit, is on [see chmod(1)], and
 *        execution is on
 *    T   the 1000 bit is turned on, and execution is off (undefined bit-
 *        state)
 *    e   z/OS external link bit
 *    Final letter may be appended:
 *    +   file has extended security attributes (e.g. ACL)
 *    Note: local listings on MacOSX also use '@'
 *    this is not allowed for here as does not appear to be shown by FTP servers
 *    {@code @}   file has extended attributes
 */
const RE_LINE = new RegExp("([bcdelfmpSs-])" // file type
    + "(((r|-)(w|-)([xsStTL-]))((r|-)(w|-)([xsStTL-]))((r|-)(w|-)([xsStTL-])))\\+?" // permissions
    + "\\s*" // separator TODO why allow it to be omitted??
    + "(\\d+)" // link count
    + "\\s+" // separator
    + "(?:(\\S+(?:\\s\\S+)*?)\\s+)?" // owner name (optional spaces)
    + "(?:(\\S+(?:\\s\\S+)*)\\s+)?" // group name (optional spaces)
    + "(\\d+(?:,\\s*\\d+)?)" // size or n,m
    + "\\s+" // separator
    /**
     * numeric or standard format date:
     *   yyyy-mm-dd (expecting hh:mm to follow)
     *   MMM [d]d
     *   [d]d MMM
     *   N.B. use non-space for MMM to allow for languages such as German which use
     *   diacritics (e.g. umlaut) in some abbreviations.
     *   Japanese uses numeric day and month with suffixes to distinguish them
     *   [d]dXX [d]dZZ
     */
    + "(" +
    "(?:\\d+[-/]\\d+[-/]\\d+)" + // yyyy-mm-dd
    "|(?:\\S{3}\\s+\\d{1,2})" + // MMM [d]d
    "|(?:\\d{1,2}\\s+\\S{3})" + // [d]d MMM
    "|(?:\\d{1,2}" + JA_MONTH + "\\s+\\d{1,2}" + JA_DAY + ")" +
    ")"
    + "\\s+" // separator
    /**
     * year (for non-recent standard format) - yyyy
     * or time (for numeric or recent standard format) [h]h:mm
     * or Japanese year - yyyyXX
     */
    + "((?:\\d+(?::\\d+)?)|(?:\\d{4}" + JA_YEAR + "))" // (20)
    + "\\s" // separator
    + "(.*)"); // the rest (21)
/**
 * Returns true if a given line might be a Unix-style listing.
 *
 * - Example: `-rw-r--r--+   1 patrick  staff   1057 Dec 11 14:35 test.txt`
 */
function testLine(line) {
    return RE_LINE.test(line);
}
exports.testLine = testLine;
/**
 * Parse a single line of a Unix-style directory listing.
 */
function parseLine(line) {
    const groups = line.match(RE_LINE);
    if (groups === null) {
        return undefined;
    }
    const name = groups[21];
    if (name === "." || name === "..") { // Ignore parent directory links
        return undefined;
    }
    const file = new FileInfo_1.FileInfo(name);
    file.size = parseInt(groups[18], 10);
    file.user = groups[16];
    file.group = groups[17];
    file.hardLinkCount = parseInt(groups[15], 10);
    file.rawModifiedAt = groups[19] + " " + groups[20];
    file.permissions = {
        user: parseMode(groups[4], groups[5], groups[6]),
        group: parseMode(groups[8], groups[9], groups[10]),
        world: parseMode(groups[12], groups[13], groups[14]),
    };
    // Set file type
    switch (groups[1].charAt(0)) {
        case "d":
            file.type = FileInfo_1.FileType.Directory;
            break;
        case "e": // NET-39 => z/OS external link
            file.type = FileInfo_1.FileType.SymbolicLink;
            break;
        case "l":
            file.type = FileInfo_1.FileType.SymbolicLink;
            break;
        case "b":
        case "c":
            file.type = FileInfo_1.FileType.File; // TODO change this if DEVICE_TYPE implemented
            break;
        case "f":
        case "-":
            file.type = FileInfo_1.FileType.File;
            break;
        default:
            // A 'whiteout' file is an ARTIFICIAL entry in any of several types of
            // 'translucent' filesystems, of which a 'union' filesystem is one.
            file.type = FileInfo_1.FileType.Unknown;
    }
    // Separate out the link name for symbolic links
    if (file.isSymbolicLink) {
        const end = name.indexOf(" -> ");
        if (end !== -1) {
            file.name = name.substring(0, end);
            file.link = name.substring(end + 4);
        }
    }
    return file;
}
exports.parseLine = parseLine;
function transformList(files) {
    return files;
}
exports.transformList = transformList;
function parseMode(r, w, x) {
    let value = 0;
    if (r !== "-") {
        value += FileInfo_1.FileInfo.UnixPermission.Read;
    }
    if (w !== "-") {
        value += FileInfo_1.FileInfo.UnixPermission.Write;
    }
    const execToken = x.charAt(0);
    if (execToken !== "-" && execToken.toUpperCase() !== execToken) {
        value += FileInfo_1.FileInfo.UnixPermission.Execute;
    }
    return value;
}


/***/ }),

/***/ 392:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var FileType;
(function (FileType) {
    FileType[FileType["Unknown"] = 0] = "Unknown";
    FileType[FileType["File"] = 1] = "File";
    FileType[FileType["Directory"] = 2] = "Directory";
    FileType[FileType["SymbolicLink"] = 3] = "SymbolicLink";
})(FileType = exports.FileType || (exports.FileType = {}));
/**
 * Describes a file, directory or symbolic link.
 */
class FileInfo {
    constructor(name) {
        this.name = name;
        this.type = FileType.Unknown;
        this.size = 0;
        /**
         * Unparsed, raw modification date as a string.
         *
         * If `modifiedAt` is undefined, the FTP server you're connected to doesn't support the more modern
         * MLSD command for machine-readable directory listings. The older command LIST is then used returning
         * results that vary a lot between servers as the format hasn't been standardized. Here, directory listings
         * and especially modification dates were meant to be human-readable first.
         *
         * Be careful when still trying to parse this by yourself. Parsing dates from listings using LIST is
         * unreliable. This library decides to offer parsed dates only when they're absolutely reliable and safe to
         * use e.g. for comparisons.
         */
        this.rawModifiedAt = "";
        /**
         * Parsed modification date.
         *
         * Available if the FTP server supports the MLSD command. Only MLSD guarantees dates than can be reliably
         * parsed with the correct timezone and a resolution down to seconds. See `rawModifiedAt` property for the unparsed
         * date that is always available.
         */
        this.modifiedAt = undefined;
        /**
         * Unix permissions if present. If the underlying FTP server is not running on Unix this will be undefined.
         * If set, you might be able to edit permissions with the FTP command `SITE CHMOD`.
         */
        this.permissions = undefined;
        /**
         * Hard link count if available.
         */
        this.hardLinkCount = undefined;
        /**
         * Link name for symbolic links if available.
         */
        this.link = undefined;
        /**
         * Unix group if available.
         */
        this.group = undefined;
        /**
         * Unix user if available.
         */
        this.user = undefined;
        /**
         * Unique ID if available.
         */
        this.uniqueID = undefined;
        this.name = name;
    }
    get isDirectory() {
        return this.type === FileType.Directory;
    }
    get isSymbolicLink() {
        return this.type === FileType.SymbolicLink;
    }
    get isFile() {
        return this.type === FileType.File;
    }
    /**
     * Deprecated, legacy API. Use `rawModifiedAt` instead.
     * @deprecated
     */
    get date() {
        return this.rawModifiedAt;
    }
    set date(rawModifiedAt) {
        this.rawModifiedAt = rawModifiedAt;
    }
}
exports.FileInfo = FileInfo;
FileInfo.UnixPermission = {
    Read: 4,
    Write: 2,
    Execute: 1
};


/***/ }),

/***/ 413:
/***/ (function(module) {

module.exports = require("stream");

/***/ }),

/***/ 431:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const LF = "\n";
/**
 * Parse an FTP control response as a collection of messages. A message is a complete
 * single- or multiline response. A response can also contain multiple multiline responses
 * that will each be represented by a message. A response can also be incomplete
 * and be completed on the next incoming data chunk for which case this function also
 * describes a `rest`. This function converts all CRLF to LF.
 */
function parseControlResponse(text) {
    const lines = text.split(/\r?\n/);
    const messages = [];
    let startAt = 0;
    let tokenRegex;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // No group has been opened.
        if (!tokenRegex) {
            if (isMultiline(line)) {
                // Open a group by setting an expected token.
                const token = line.substr(0, 3);
                tokenRegex = new RegExp(`^${token}(?:$| )`);
                startAt = i;
            }
            else if (isSingleLine(line)) {
                // Single lines can be grouped immediately.
                messages.push(line);
            }
        }
        // Group has been opened, expect closing token.
        else if (tokenRegex.test(line)) {
            tokenRegex = undefined;
            messages.push(lines.slice(startAt, i + 1).join(LF));
        }
    }
    // The last group might not have been closed, report it as a rest.
    const rest = tokenRegex ? lines.slice(startAt).join(LF) + LF : "";
    return { messages, rest };
}
exports.parseControlResponse = parseControlResponse;
function isSingleLine(line) {
    return /^\d\d\d(?:$| )/.test(line);
}
exports.isSingleLine = isSingleLine;
function isMultiline(line) {
    return /^\d\d\d-/.test(line);
}
exports.isMultiline = isMultiline;
/**
 * Return true if an FTP return code describes a positive completion.
 */
function positiveCompletion(code) {
    return code >= 200 && code < 300;
}
exports.positiveCompletion = positiveCompletion;
/**
 * Return true if an FTP return code describes a positive intermediate response.
 */
function positiveIntermediate(code) {
    return code >= 300 && code < 400;
}
exports.positiveIntermediate = positiveIntermediate;


/***/ }),

/***/ 435:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = __webpack_require__(362);
const os = __importStar(__webpack_require__(87));
const path = __importStar(__webpack_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = command_1.toCommandValue(val);
    process.env[name] = convertedVal;
    command_1.issueCommand('set-env', { name }, convertedVal);
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    command_1.issueCommand('add-path', {}, inputPath);
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 490:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Public API
 */
__export(__webpack_require__(934));
__export(__webpack_require__(574));
__export(__webpack_require__(392));
__export(__webpack_require__(529));
var transfer_1 = __webpack_require__(616);
exports.enterPassiveModeIPv4 = transfer_1.enterPassiveModeIPv4;
exports.enterPassiveModeIPv6 = transfer_1.enterPassiveModeIPv6;


/***/ }),

/***/ 529:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dosParser = __importStar(__webpack_require__(103));
const unixParser = __importStar(__webpack_require__(387));
const mlsdParser = __importStar(__webpack_require__(707));
/**
 * Available directory listing parsers. These are candidates that will be tested
 * in the order presented. The first candidate will be used to parse the whole list.
 */
const availableParsers = [
    dosParser,
    unixParser,
    mlsdParser // Keep MLSD last, may accept filename only
];
function firstCompatibleParser(line, parsers) {
    return parsers.find(parser => parser.testLine(line) === true);
}
function stringIsNotBlank(str) {
    return str.trim() !== "";
}
const REGEX_NEWLINE = /\r?\n/;
/**
 * Parse raw directory listing.
 */
function parseList(rawList) {
    const lines = rawList
        .split(REGEX_NEWLINE)
        .filter(stringIsNotBlank);
    if (lines.length === 0) {
        return [];
    }
    const testLine = lines[lines.length - 1];
    const parser = firstCompatibleParser(testLine, availableParsers);
    if (!parser) {
        throw new Error("This library only supports MLSD, Unix- or DOS-style directory listing. Your FTP server seems to be using another format. You can see the transmitted listing when setting `client.ftp.verbose = true`. You can then provide a custom parser to `client.parseList`, see the documentation for details.");
    }
    const files = lines
        .map(parser.parseLine)
        .filter((info) => info !== undefined);
    return parser.transformList(files);
}
exports.parseList = parseList;


/***/ }),

/***/ 574:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __webpack_require__(631);
const parseControlResponse_1 = __webpack_require__(431);
/**
 * Describes an FTP server error response including the FTP response code.
 */
class FTPError extends Error {
    constructor(res) {
        super(res.message);
        this.name = this.constructor.name;
        this.code = res.code;
    }
}
exports.FTPError = FTPError;
/**
 * FTPContext holds the control and data sockets of an FTP connection and provides a
 * simplified way to interact with an FTP server, handle responses, errors and timeouts.
 *
 * It doesn't implement or use any FTP commands. It's only a foundation to make writing an FTP
 * client as easy as possible. You won't usually instantiate this, but use `Client`.
 */
class FTPContext {
    /**
     * Instantiate an FTP context.
     *
     * @param timeout - Timeout in milliseconds to apply to control and data connections. Use 0 for no timeout.
     * @param encoding - Encoding to use for control connection. UTF-8 by default. Use "latin1" for older servers.
     */
    constructor(timeout = 0, encoding = "utf8") {
        this.timeout = timeout;
        /** Debug-level logging of all socket communication. */
        this.verbose = false;
        /** IP version to prefer (4: IPv4, 6: IPv6, undefined: automatic). */
        this.ipFamily = undefined;
        /** Options for TLS connections. */
        this.tlsOptions = {};
        /** A multiline response might be received as multiple chunks. */
        this._partialResponse = "";
        this._encoding = encoding;
        // Help Typescript understand that we do indeed set _socket in the constructor but use the setter method to do so.
        this._socket = this.socket = this._newSocket();
        this._dataSocket = undefined;
    }
    /**
     * Close the context.
     */
    close() {
        // Internally, closing a context is always described with an error. If there is still a task running, it will
        // abort with an exception that the user closed the client during a task. If no task is running, no exception is
        // thrown but all newly submitted tasks after that will abort the exception that the client has been closed.
        // In addition the user will get a stack trace pointing to where exactly the client has been closed. So in any
        // case use _closingError to determine whether a context is closed. This also allows us to have a single code-path
        // for closing a context making the implementation easier.
        const message = this._task ? "User closed client during task" : "User closed client";
        const err = new Error(message);
        this.closeWithError(err);
    }
    /**
     * Close the context with an error.
     */
    closeWithError(err) {
        // If this context already has been closed, don't overwrite the reason.
        if (this._closingError) {
            return;
        }
        this._closingError = err;
        // Before giving the user's task a chance to react, make sure we won't be bothered with any inputs.
        this._closeSocket(this._socket);
        this._closeSocket(this._dataSocket);
        // Give the user's task a chance to react, maybe cleanup resources.
        this._passToHandler(err);
        // The task might not have been rejected by the user after receiving the error.
        this._stopTrackingTask();
    }
    /**
     * Returns true if this context has been closed or hasn't been connected yet. You can reopen it with `access`.
     */
    get closed() {
        return this.socket.remoteAddress === undefined || this._closingError !== undefined;
    }
    /**
     * Reset this contex and all of its state.
     */
    reset() {
        this.socket = this._newSocket();
    }
    /**
     * Get the FTP control socket.
     */
    get socket() {
        return this._socket;
    }
    /**
     * Set the socket for the control connection. This will only close the current control socket
     * if the new one is not an upgrade to the current one.
     */
    set socket(socket) {
        // No data socket should be open in any case where the control socket is set or upgraded.
        this.dataSocket = undefined;
        // This being a soft reset, remove any remaining partial response.
        this._partialResponse = "";
        if (this._socket) {
            // Only close the current connection if the new is not an upgrade.
            const isUpgrade = socket.localPort === this._socket.localPort;
            if (!isUpgrade) {
                this._socket.destroy();
            }
            this._removeSocketListeners(this._socket);
        }
        if (socket) {
            // Setting a completely new control socket is in essence something like a reset. That's
            // why we also close any open data connection above. We can go one step further and reset
            // a possible closing error. That means that a closed FTPContext can be "reopened" by
            // setting a new control socket.
            this._closingError = undefined;
            // Don't set a timeout yet. Timeout for control sockets is only active during a task, see handle() below.
            socket.setTimeout(0);
            socket.setEncoding(this._encoding);
            socket.setKeepAlive(true);
            socket.on("data", data => this._onControlSocketData(data));
            // Server sending a FIN packet is treated as an error.
            socket.on("end", () => this.closeWithError(new Error("Server closed connection.")));
            // Control being closed without error by server is treated as an error.
            socket.on("close", hadError => { if (!hadError)
                this.closeWithError(new Error("Server closed connection.")); });
            this._setupErrorHandlers(socket, "control socket");
        }
        this._socket = socket;
    }
    /**
     * Get the current FTP data connection if present.
     */
    get dataSocket() {
        return this._dataSocket;
    }
    /**
     * Set the socket for the data connection. This will automatically close the former data socket.
     */
    set dataSocket(socket) {
        this._closeSocket(this._dataSocket);
        if (socket) {
            // Don't set a timeout yet. Timeout data socket should be activated when data transmission starts
            // and timeout on control socket is deactivated.
            socket.setTimeout(0);
            this._setupErrorHandlers(socket, "data socket");
        }
        this._dataSocket = socket;
    }
    /**
     * Get the currently used encoding.
     */
    get encoding() {
        return this._encoding;
    }
    /**
     * Set the encoding used for the control socket.
     *
     * See https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings for what encodings
     * are supported by Node.
     */
    set encoding(encoding) {
        this._encoding = encoding;
        if (this.socket) {
            this.socket.setEncoding(encoding);
        }
    }
    /**
     * Send an FTP command without waiting for or handling the result.
     */
    send(command) {
        const containsPassword = command.startsWith("PASS");
        const message = containsPassword ? "> PASS ###" : `> ${command}`;
        this.log(message);
        this._socket.write(command + "\r\n", this.encoding);
    }
    /**
     * Send an FTP command and handle the first response. Use this if you have a simple
     * request-response situation.
     */
    request(command) {
        return this.handle(command, (res, task) => {
            if (res instanceof Error) {
                task.reject(res);
            }
            else {
                task.resolve(res);
            }
        });
    }
    /**
     * Send an FTP command and handle any response until you resolve/reject. Use this if you expect multiple responses
     * to a request. This returns a Promise that will hold whatever the response handler passed on when resolving/rejecting its task.
     */
    handle(command, responseHandler) {
        if (this._task) {
            // The user or client instance called `handle()` while a task is still running.
            const err = new Error("User launched a task while another one is still running. Forgot to use 'await' or '.then()'?");
            err.stack += `\nRunning task launched at: ${this._task.stack}`;
            this.closeWithError(err);
            // Don't return here, continue with returning the Promise that will then be rejected
            // because the context closed already. That way, users will receive an exception where
            // they called this method by mistake.
        }
        return new Promise((resolvePromise, rejectPromise) => {
            const stack = new Error().stack || "Unknown call stack";
            const resolver = {
                resolve: (...args) => {
                    this._stopTrackingTask();
                    resolvePromise(...args);
                },
                reject: err => {
                    this._stopTrackingTask();
                    rejectPromise(err);
                }
            };
            this._task = {
                stack,
                resolver,
                responseHandler
            };
            if (this._closingError) {
                // This client has been closed. Provide an error that describes this one as being caused
                // by `_closingError`, include stack traces for both.
                const err = new Error("Client is closed"); // Type 'Error' is not correctly defined, doesn't have 'code'.
                err.stack += `\nClosing reason: ${this._closingError.stack}`;
                err.code = this._closingError.code !== undefined ? this._closingError.code : "0";
                this._passToHandler(err);
                return;
            }
            // Only track control socket timeout during the lifecycle of a task. This avoids timeouts on idle sockets,
            // the default socket behaviour which is not expected by most users.
            this.socket.setTimeout(this.timeout);
            if (command) {
                this.send(command);
            }
        });
    }
    /**
     * Log message if set to be verbose.
     */
    log(message) {
        if (this.verbose) {
            // tslint:disable-next-line no-console
            console.log(message);
        }
    }
    /**
     * Return true if the control socket is using TLS. This does not mean that a session
     * has already been negotiated.
     */
    get hasTLS() {
        return "encrypted" in this._socket;
    }
    /**
     * Removes reference to current task and handler. This won't resolve or reject the task.
     * @protected
     */
    _stopTrackingTask() {
        // Disable timeout on control socket if there is no task active.
        this.socket.setTimeout(0);
        this._task = undefined;
    }
    /**
     * Handle incoming data on the control socket. The chunk is going to be of type `string`
     * because we let `socket` handle encoding with `setEncoding`.
     * @protected
     */
    _onControlSocketData(chunk) {
        const trimmedChunk = chunk.trim();
        this.log(`< ${trimmedChunk}`);
        // This chunk might complete an earlier partial response.
        const completeResponse = this._partialResponse + trimmedChunk;
        const parsed = parseControlResponse_1.parseControlResponse(completeResponse);
        // Remember any incomplete remainder.
        this._partialResponse = parsed.rest;
        // Each response group is passed along individually.
        for (const message of parsed.messages) {
            const code = parseInt(message.substr(0, 3), 10);
            const response = { code, message };
            const err = code >= 400 ? new FTPError(response) : undefined;
            this._passToHandler(err ? err : response);
        }
    }
    /**
     * Send the current handler a response. This is usually a control socket response
     * or a socket event, like an error or timeout.
     * @protected
     */
    _passToHandler(response) {
        if (this._task) {
            this._task.responseHandler(response, this._task.resolver);
        }
        // Errors other than FTPError always close the client. If there isn't an active task to handle the error,
        // the next one submitted will receive it using `_closingError`.
        // There is only one edge-case: If there is an FTPError while no task is active, the error will be dropped.
        // But that means that the user sent an FTP command with no intention of handling the result. So why should the
        // error be handled? Maybe log it at least? Debug logging will already do that and the client stays useable after
        // FTPError. So maybe no need to do anything here.
    }
    /**
     * Setup all error handlers for a socket.
     * @protected
     */
    _setupErrorHandlers(socket, identifier) {
        socket.once("error", error => {
            error.message += ` (${identifier})`;
            this.closeWithError(error);
        });
        socket.once("close", hadError => {
            if (hadError) {
                this.closeWithError(new Error(`Socket closed due to transmission error (${identifier})`));
            }
        });
        socket.once("timeout", () => this.closeWithError(new Error(`Timeout (${identifier})`)));
    }
    /**
     * Close a socket.
     * @protected
     */
    _closeSocket(socket) {
        if (socket) {
            socket.destroy();
            this._removeSocketListeners(socket);
        }
    }
    /**
     * Remove all default listeners for socket.
     * @protected
     */
    _removeSocketListeners(socket) {
        socket.removeAllListeners();
        // Before Node.js 10.3.0, using `socket.removeAllListeners()` without any name did not work: https://github.com/nodejs/node/issues/20923.
        socket.removeAllListeners("timeout");
        socket.removeAllListeners("data");
        socket.removeAllListeners("end");
        socket.removeAllListeners("error");
        socket.removeAllListeners("close");
        socket.removeAllListeners("connect");
    }
    /**
     * Provide a new socket instance.
     *
     * Internal use only, replaced for unit tests.
     */
    _newSocket() {
        return new net_1.Socket();
    }
}
exports.FTPContext = FTPContext;


/***/ }),

/***/ 610:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tracks progress of one socket data transfer at a time.
 */
class ProgressTracker {
    constructor() {
        this.bytesOverall = 0;
        this.intervalMs = 500;
        this.onStop = noop;
        this.onHandle = noop;
    }
    /**
     * Register a new handler for progress info. Use `undefined` to disable reporting.
     */
    reportTo(onHandle = noop) {
        this.onHandle = onHandle;
    }
    /**
     * Start tracking transfer progress of a socket.
     *
     * @param socket  The socket to observe.
     * @param name  A name associated with this progress tracking, e.g. a filename.
     * @param type  The type of the transfer, typically "upload" or "download".
     */
    start(socket, name, type) {
        let lastBytes = 0;
        this.onStop = poll(this.intervalMs, () => {
            const bytes = socket.bytesRead + socket.bytesWritten;
            this.bytesOverall += bytes - lastBytes;
            lastBytes = bytes;
            this.onHandle({
                name,
                type,
                bytes,
                bytesOverall: this.bytesOverall
            });
        });
    }
    /**
     * Stop tracking transfer progress.
     */
    stop() {
        this.onStop(false);
    }
    /**
     * Call the progress handler one more time, then stop tracking.
     */
    updateAndStop() {
        this.onStop(true);
    }
}
exports.ProgressTracker = ProgressTracker;
/**
 * Starts calling a callback function at a regular interval. The first call will go out
 * immediately. The function returns a function to stop the polling.
 */
function poll(intervalMs, updateFunc) {
    const id = setInterval(updateFunc, intervalMs);
    const stopFunc = (stopWithUpdate) => {
        clearInterval(id);
        if (stopWithUpdate) {
            updateFunc();
        }
        // Prevent repeated calls to stop calling handler.
        updateFunc = noop;
    };
    updateFunc();
    return stopFunc;
}
function noop() { }


/***/ }),

/***/ 616:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const netUtils_1 = __webpack_require__(696);
const tls_1 = __webpack_require__(16);
const parseControlResponse_1 = __webpack_require__(431);
/**
 * Prepare a data socket using passive mode over IPv6.
 */
async function enterPassiveModeIPv6(ftp) {
    const res = await ftp.request("EPSV");
    const port = parseEpsvResponse(res.message);
    if (!port) {
        throw new Error("Can't parse EPSV response: " + res.message);
    }
    const controlHost = ftp.socket.remoteAddress;
    if (controlHost === undefined) {
        throw new Error("Control socket is disconnected, can't get remote address.");
    }
    await connectForPassiveTransfer(controlHost, port, ftp);
    return res;
}
exports.enterPassiveModeIPv6 = enterPassiveModeIPv6;
/**
 * Parse an EPSV response. Returns only the port as in EPSV the host of the control connection is used.
 */
function parseEpsvResponse(message) {
    // Get port from EPSV response, e.g. "229 Entering Extended Passive Mode (|||6446|)"
    // Some FTP Servers such as the one on IBM i (OS/400) use ! instead of | in their EPSV response.
    const groups = message.match(/[|!]{3}(.+)[|!]/);
    if (groups === null || groups[1] === undefined) {
        throw new Error(`Can't parse response to 'EPSV': ${message}`);
    }
    const port = parseInt(groups[1], 10);
    if (Number.isNaN(port)) {
        throw new Error(`Can't parse response to 'EPSV', port is not a number: ${message}`);
    }
    return port;
}
exports.parseEpsvResponse = parseEpsvResponse;
/**
 * Prepare a data socket using passive mode over IPv4.
 */
async function enterPassiveModeIPv4(ftp) {
    const res = await ftp.request("PASV");
    const target = parsePasvResponse(res.message);
    if (!target) {
        throw new Error("Can't parse PASV response: " + res.message);
    }
    // If the host in the PASV response has a local address while the control connection hasn't,
    // we assume a NAT issue and use the IP of the control connection as the target for the data connection.
    // We can't always perform this replacement because it's possible (although unlikely) that the FTP server
    // indeed uses a different host for data connections.
    const controlHost = ftp.socket.remoteAddress;
    if (netUtils_1.ipIsPrivateV4Address(target.host) && controlHost && !netUtils_1.ipIsPrivateV4Address(controlHost)) {
        target.host = controlHost;
    }
    await connectForPassiveTransfer(target.host, target.port, ftp);
    return res;
}
exports.enterPassiveModeIPv4 = enterPassiveModeIPv4;
/**
 * Parse a PASV response.
 */
function parsePasvResponse(message) {
    // Get host and port from PASV response, e.g. "227 Entering Passive Mode (192,168,1,100,10,229)"
    const groups = message.match(/([-\d]+,[-\d]+,[-\d]+,[-\d]+),([-\d]+),([-\d]+)/);
    if (groups === null || groups.length !== 4) {
        throw new Error(`Can't parse response to 'PASV': ${message}`);
    }
    return {
        host: groups[1].replace(/,/g, "."),
        port: (parseInt(groups[2], 10) & 255) * 256 + (parseInt(groups[3], 10) & 255)
    };
}
exports.parsePasvResponse = parsePasvResponse;
function connectForPassiveTransfer(host, port, ftp) {
    return new Promise((resolve, reject) => {
        const handleConnErr = function (err) {
            err.message = "Can't open data connection in passive mode: " + err.message;
            reject(err);
        };
        let socket = ftp._newSocket();
        socket.on("error", handleConnErr);
        socket.connect({ port, host, family: ftp.ipFamily }, () => {
            if (ftp.socket instanceof tls_1.TLSSocket) {
                socket = tls_1.connect(Object.assign({}, ftp.tlsOptions, {
                    socket,
                    // Reuse the TLS session negotiated earlier when the control connection
                    // was upgraded. Servers expect this because it provides additional
                    // security: If a completely new session would be negotiated, a hacker
                    // could guess the port and connect to the new data connection before we do
                    // by just starting his/her own TLS session.
                    session: ftp.socket.getSession()
                }));
                // It's the responsibility of the transfer task to wait until the
                // TLS socket issued the event 'secureConnect'. We can't do this
                // here because some servers will start upgrading after the
                // specific transfer request has been made. List and download don't
                // have to wait for this event because the server sends whenever it
                // is ready. But for upload this has to be taken into account,
                // see the details in the upload() function below.
            }
            // Let the FTPContext listen to errors from now on, remove local handler.
            socket.removeListener("error", handleConnErr);
            ftp.dataSocket = socket;
            resolve();
        });
    });
}
exports.connectForPassiveTransfer = connectForPassiveTransfer;
/**
 * Helps resolving/rejecting transfers.
 *
 * This is used internally for all FTP transfers. For example when downloading, the server might confirm
 * with "226 Transfer complete" when in fact the download on the data connection has not finished
 * yet. With all transfers we make sure that a) the result arrived and b) has been confirmed by
 * e.g. the control connection. We just don't know in which order this will happen.
 */
class TransferResolver {
    /**
     * Instantiate a TransferResolver
     */
    constructor(ftp, progress) {
        this.ftp = ftp;
        this.progress = progress;
        this.response = undefined;
        this.dataTransferDone = false;
    }
    /**
     * Mark the beginning of a transfer.
     *
     * @param name - Name of the transfer, usually the filename.
     * @param type - Type of transfer, usually "upload" or "download".
     */
    onDataStart(name, type) {
        // Let the data socket be in charge of tracking timeouts during transfer.
        // The control socket sits idle during this time anyway and might provoke
        // a timeout unnecessarily. The control connection will take care
        // of timeouts again once data transfer is complete or failed.
        if (this.ftp.dataSocket === undefined) {
            throw new Error("Data transfer should start but there is no data connection.");
        }
        this.ftp.socket.setTimeout(0);
        this.ftp.dataSocket.setTimeout(this.ftp.timeout);
        this.progress.start(this.ftp.dataSocket, name, type);
    }
    /**
     * The data connection has finished the transfer.
     */
    onDataDone(task) {
        this.progress.updateAndStop();
        // Hand-over timeout tracking back to the control connection. It's possible that
        // we don't receive the response over the control connection that the transfer is
        // done. In this case, we want to correctly associate the resulting timeout with
        // the control connection.
        this.ftp.socket.setTimeout(this.ftp.timeout);
        if (this.ftp.dataSocket) {
            this.ftp.dataSocket.setTimeout(0);
        }
        this.dataTransferDone = true;
        this.tryResolve(task);
    }
    /**
     * The control connection reports the transfer as finished.
     */
    onControlDone(task, response) {
        this.response = response;
        this.tryResolve(task);
    }
    /**
     * An error has been reported and the task should be rejected.
     */
    onError(task, err) {
        this.progress.updateAndStop();
        this.ftp.socket.setTimeout(this.ftp.timeout);
        this.ftp.dataSocket = undefined;
        task.reject(err);
    }
    /**
     * Control connection sent an unexpected request requiring a response from our part. We
     * can't provide that (because unknown) and have to close the contrext with an error because
     * the FTP server is now caught up in a state we can't resolve.
     */
    onUnexpectedRequest(response) {
        const err = new Error(`Unexpected FTP response is requesting an answer: ${response.message}`);
        this.ftp.closeWithError(err);
    }
    tryResolve(task) {
        // To resolve, we need both control and data connection to report that the transfer is done.
        const canResolve = this.dataTransferDone && this.response !== undefined;
        if (canResolve) {
            this.ftp.dataSocket = undefined;
            task.resolve(this.response);
        }
    }
}
function uploadFrom(source, config) {
    const resolver = new TransferResolver(config.ftp, config.tracker);
    const fullCommand = `${config.command} ${config.remotePath}`;
    return config.ftp.handle(fullCommand, (res, task) => {
        if (res instanceof Error) {
            resolver.onError(task, res);
        }
        else if (res.code === 150 || res.code === 125) { // Ready to upload
            const dataSocket = config.ftp.dataSocket;
            if (!dataSocket) {
                resolver.onError(task, new Error("Upload should begin but no data connection is available."));
                return;
            }
            // If we are using TLS, we have to wait until the dataSocket issued
            // 'secureConnect'. If this hasn't happened yet, getCipher() returns undefined.
            const canUpload = "getCipher" in dataSocket ? dataSocket.getCipher() !== undefined : true;
            onConditionOrEvent(canUpload, dataSocket, "secureConnect", () => {
                config.ftp.log(`Uploading to ${netUtils_1.describeAddress(dataSocket)} (${netUtils_1.describeTLS(dataSocket)})`);
                resolver.onDataStart(config.remotePath, config.type);
                source.pipe(dataSocket).once("finish", () => {
                    dataSocket.destroy(); // Explicitly close/destroy the socket to signal the end.
                    resolver.onDataDone(task);
                });
            });
        }
        else if (parseControlResponse_1.positiveCompletion(res.code)) { // Transfer complete
            resolver.onControlDone(task, res);
        }
        else if (parseControlResponse_1.positiveIntermediate(res.code)) {
            resolver.onUnexpectedRequest(res);
        }
        // Ignore all other positive preliminary response codes (< 200)
    });
}
exports.uploadFrom = uploadFrom;
function downloadTo(destination, config) {
    if (!config.ftp.dataSocket) {
        throw new Error("Download will be initiated but no data connection is available.");
    }
    // It's possible that data transmission begins before the control socket
    // receives the announcement. Start listening for data immediately.
    config.ftp.dataSocket.pipe(destination);
    const resolver = new TransferResolver(config.ftp, config.tracker);
    return config.ftp.handle(config.command, (res, task) => {
        if (res instanceof Error) {
            resolver.onError(task, res);
        }
        else if (res.code === 150 || res.code === 125) { // Ready to download
            const dataSocket = config.ftp.dataSocket;
            if (!dataSocket) {
                resolver.onError(task, new Error("Download should begin but no data connection is available."));
                return;
            }
            config.ftp.log(`Downloading from ${netUtils_1.describeAddress(dataSocket)} (${netUtils_1.describeTLS(dataSocket)})`);
            resolver.onDataStart(config.remotePath, config.type);
            onConditionOrEvent(destination.destroyed || destination.writableFinished, destination, "finish", () => resolver.onDataDone(task));
        }
        else if (res.code === 350) { // Restarting at startAt.
            config.ftp.send("RETR " + config.remotePath);
        }
        else if (parseControlResponse_1.positiveCompletion(res.code)) { // Transfer complete
            resolver.onControlDone(task, res);
        }
        else if (parseControlResponse_1.positiveIntermediate(res.code)) {
            resolver.onUnexpectedRequest(res);
        }
        // Ignore all other positive preliminary response codes (< 200)
    });
}
exports.downloadTo = downloadTo;
/**
 * Calls a function immediately if a condition is met or subscribes to an event and calls
 * it once the event is emitted.
 *
 * @param condition  The condition to test.
 * @param emitter  The emitter to use if the condition is not met.
 * @param eventName  The event to subscribe to if the condition is not met.
 * @param action  The function to call.
 */
function onConditionOrEvent(condition, emitter, eventName, action) {
    if (condition === true) {
        action();
    }
    else {
        emitter.once(eventName, () => action());
    }
}


/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ }),

/***/ 631:
/***/ (function(module) {

module.exports = require("net");

/***/ }),

/***/ 669:
/***/ (function(module) {

module.exports = require("util");

/***/ }),

/***/ 696:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tls_1 = __webpack_require__(16);
/**
 * Returns a string describing the encryption on a given socket instance.
 */
function describeTLS(socket) {
    if (socket instanceof tls_1.TLSSocket) {
        const protocol = socket.getProtocol();
        return protocol ? protocol : "Server socket or disconnected client socket";
    }
    return "No encryption";
}
exports.describeTLS = describeTLS;
/**
 * Returns a string describing the remote address of a socket.
 */
function describeAddress(socket) {
    if (socket.remoteFamily === "IPv6") {
        return `[${socket.remoteAddress}]:${socket.remotePort}`;
    }
    return `${socket.remoteAddress}:${socket.remotePort}`;
}
exports.describeAddress = describeAddress;
/**
 * Upgrade a socket connection with TLS.
 */
function upgradeSocket(socket, options) {
    return new Promise((resolve, reject) => {
        const tlsOptions = Object.assign({}, options, {
            socket
        });
        const tlsSocket = tls_1.connect(tlsOptions, () => {
            const expectCertificate = tlsOptions.rejectUnauthorized !== false;
            if (expectCertificate && !tlsSocket.authorized) {
                reject(tlsSocket.authorizationError);
            }
            else {
                // Remove error listener added below.
                tlsSocket.removeAllListeners("error");
                resolve(tlsSocket);
            }
        }).once("error", error => {
            reject(error);
        });
    });
}
exports.upgradeSocket = upgradeSocket;
/**
 * Returns true if an IP is a private address according to https://tools.ietf.org/html/rfc1918#section-3.
 * This will handle IPv4-mapped IPv6 addresses correctly but return false for all other IPv6 addresses.
 *
 * @param ip  The IP as a string, e.g. "192.168.0.1"
 */
function ipIsPrivateV4Address(ip = "") {
    // Handle IPv4-mapped IPv6 addresses like ::ffff:192.168.0.1
    if (ip.startsWith("::ffff:")) {
        ip = ip.substr(7); // Strip ::ffff: prefix
    }
    const octets = ip.split(".").map(o => parseInt(o, 10));
    return octets[0] === 10 // 10.0.0.0 - 10.255.255.255
        || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) // 172.16.0.0 - 172.31.255.255
        || (octets[0] === 192 && octets[1] === 168); // 192.168.0.0 - 192.168.255.255
}
exports.ipIsPrivateV4Address = ipIsPrivateV4Address;


/***/ }),

/***/ 707:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const FileInfo_1 = __webpack_require__(392);
function parseSize(value, info) {
    info.size = parseInt(value, 10);
}
/**
 * Parsers for MLSD facts.
 */
const factHandlersByName = {
    "size": parseSize,
    "sizd": parseSize,
    "unique": (value, info) => {
        info.uniqueID = value;
    },
    "modify": (value, info) => {
        info.modifiedAt = parseMLSxDate(value);
        info.rawModifiedAt = info.modifiedAt.toISOString();
    },
    "type": (value, info) => {
        // There seems to be confusion on how to handle symbolic links for Unix. RFC 3659 doesn't describe
        // this but mentions some examples using the syntax `type=OS.unix=slink:<target>`. But according to
        // an entry in the Errata (https://www.rfc-editor.org/errata/eid1500) this syntax can't be valid.
        // Instead it proposes to use `type=OS.unix=symlink` and to then list the actual target of the
        // symbolic link as another entry in the directory listing. The unique identifiers can then be used
        // to derive the connection between link(s) and target. We'll have to handle both cases as there
        // are differing opinions on how to deal with this. Here are some links on this topic:
        // - ProFTPD source: https://github.com/proftpd/proftpd/blob/56e6dfa598cbd4ef5c6cba439bcbcd53a63e3b21/modules/mod_facts.c#L531
        // - ProFTPD bug: http://bugs.proftpd.org/show_bug.cgi?id=3318
        // - ProFTPD statement: http://www.proftpd.org/docs/modules/mod_facts.html
        // – FileZilla bug: https://trac.filezilla-project.org/ticket/9310
        if (value.startsWith("OS.unix=slink")) {
            info.type = FileInfo_1.FileType.SymbolicLink;
            info.link = value.substr(value.indexOf(":") + 1);
            return 1 /* Continue */;
        }
        switch (value) {
            case "file":
                info.type = FileInfo_1.FileType.File;
                break;
            case "dir":
                info.type = FileInfo_1.FileType.Directory;
                break;
            case "OS.unix=symlink":
                info.type = FileInfo_1.FileType.SymbolicLink;
                // The target of the symbolic link might be defined in another line in the directory listing.
                // We'll handle this in `transformList()` below.
                break;
            case "cdir": // Current directory being listed
            case "pdir": // Parent directory
                return 2 /* IgnoreFile */; // Don't include these entries in the listing
            default:
                info.type = FileInfo_1.FileType.Unknown;
        }
        return 1 /* Continue */;
    },
    "unix.mode": (value, info) => {
        const digits = value.substr(-3);
        info.permissions = {
            user: parseInt(digits[0], 10),
            group: parseInt(digits[1], 10),
            world: parseInt(digits[2], 10)
        };
    },
    "unix.ownername": (value, info) => {
        info.user = value;
    },
    "unix.owner": (value, info) => {
        if (info.user === undefined)
            info.user = value;
    },
    get "unix.uid"() {
        return this["unix.owner"];
    },
    "unix.groupname": (value, info) => {
        info.group = value;
    },
    "unix.group": (value, info) => {
        if (info.group === undefined)
            info.group = value;
    },
    get "unix.gid"() {
        return this["unix.group"];
    }
    // Regarding the fact "perm":
    // We don't handle permission information stored in "perm" because its information is conceptually
    // different from what users of FTP clients usually associate with "permissions". Those that have
    // some expectations (and probably want to edit them with a SITE command) often unknowingly expect
    // the Unix permission system. The information passed by "perm" describes what FTP commands can be
    // executed with a file/directory. But even this can be either incomplete or just meant as a "guide"
    // as the spec mentions. From https://tools.ietf.org/html/rfc3659#section-7.5.5: "The permissions are
    // described here as they apply to FTP commands. They may not map easily into particular permissions
    // available on the server's operating system." The parser by Apache Commons tries to translate these
    // to Unix permissions – this is misleading users and might not even be correct.
};
/**
 * Split a string once at the first position of a delimiter. For example
 * `splitStringOnce("a b c d", " ")` returns `["a", "b c d"]`.
 */
function splitStringOnce(str, delimiter) {
    const pos = str.indexOf(delimiter);
    const a = str.substr(0, pos);
    const b = str.substr(pos + delimiter.length);
    return [a, b];
}
/**
 * Returns true if a given line might be part of an MLSD listing.
 *
 * - Example 1: `size=15227;type=dir;perm=el;modify=20190419065730; test one`
 * - Example 2: ` file name` (leading space)
 */
function testLine(line) {
    return /^\S+=\S+;/.test(line) || line.startsWith(" ");
}
exports.testLine = testLine;
/**
 * Parse single line as MLSD listing, see specification at https://tools.ietf.org/html/rfc3659#section-7.
 */
function parseLine(line) {
    const [packedFacts, name] = splitStringOnce(line, " ");
    if (name === "" || name === "." || name === "..") {
        return undefined;
    }
    const info = new FileInfo_1.FileInfo(name);
    const facts = packedFacts.split(";");
    for (const fact of facts) {
        const [factName, factValue] = splitStringOnce(fact, "=");
        if (!factValue) {
            continue;
        }
        const factHandler = factHandlersByName[factName.toLowerCase()];
        if (!factHandler) {
            continue;
        }
        const result = factHandler(factValue, info);
        if (result === 2 /* IgnoreFile */) {
            return undefined;
        }
    }
    return info;
}
exports.parseLine = parseLine;
function transformList(files) {
    // Create a map of all files that are not symbolic links by their unique ID
    const nonLinksByID = new Map();
    for (const file of files) {
        if (!file.isSymbolicLink && file.uniqueID !== undefined) {
            nonLinksByID.set(file.uniqueID, file);
        }
    }
    const resolvedFiles = [];
    for (const file of files) {
        // Try to associate unresolved symbolic links with a target file/directory.
        if (file.isSymbolicLink && file.uniqueID !== undefined && file.link === undefined) {
            const target = nonLinksByID.get(file.uniqueID);
            if (target !== undefined) {
                file.link = target.name;
            }
        }
        // The target of a symbolic link is listed as an entry in the directory listing but might
        // have a path pointing outside of this directory. In that case we don't want this entry
        // to be part of the listing. We generally don't want these kind of entries at all.
        const isPartOfDirectory = !file.name.includes("/");
        if (isPartOfDirectory) {
            resolvedFiles.push(file);
        }
    }
    return resolvedFiles;
}
exports.transformList = transformList;
/**
 * Parse date as specified in https://tools.ietf.org/html/rfc3659#section-2.3.
 *
 * Message contains response code and modified time in the format: YYYYMMDDHHMMSS[.sss]
 * For example `19991005213102` or `19980615100045.014`.
 */
function parseMLSxDate(fact) {
    return new Date(Date.UTC(+fact.slice(0, 4), // Year
    +fact.slice(4, 6) - 1, // Month
    +fact.slice(6, 8), // Date
    +fact.slice(8, 10), // Hours
    +fact.slice(10, 12), // Minutes
    +fact.slice(12, 14), // Seconds
    +fact.slice(15, 18) // Milliseconds
    ));
}
exports.parseMLSxDate = parseMLSxDate;


/***/ }),

/***/ 737:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {

const core = __webpack_require__(435);
const ftp = __webpack_require__(490)

try {
    deploy()
    
} catch (error) {
    core.setFailed(error.message);
}
 
async function deploy() {
    const client = new ftp.Client()
    client.ftp.verbose = true
    try {
        await client.access({
            host: core.getInput('host'),
            user: core.getInput('user'),
            password: core.getInput('password'),
            secure: true
        })
        await client.ensureDir(core.getInput('remote-dir'))
        await client.clearWorkingDir()
        await client.uploadFromDir(core.getInput('local-dir'))
    }
    catch(error) {
        core.setFailed(error.message);
    }
    client.close()
}

/***/ }),

/***/ 747:
/***/ (function(module) {

module.exports = require("fs");

/***/ }),

/***/ 934:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __webpack_require__(747);
const path_1 = __webpack_require__(622);
const util_1 = __webpack_require__(669);
const FtpContext_1 = __webpack_require__(574);
const parseList_1 = __webpack_require__(529);
const ProgressTracker_1 = __webpack_require__(610);
const StringWriter_1 = __webpack_require__(156);
const parseListMLSD_1 = __webpack_require__(707);
const netUtils_1 = __webpack_require__(696);
const transfer_1 = __webpack_require__(616);
const parseControlResponse_1 = __webpack_require__(431);
// Use promisify to keep the library compatible with Node 8.
const fsReadDir = util_1.promisify(fs_1.readdir);
const fsMkDir = util_1.promisify(fs_1.mkdir);
const fsStat = util_1.promisify(fs_1.stat);
const fsOpen = util_1.promisify(fs_1.open);
const fsClose = util_1.promisify(fs_1.close);
const fsUnlink = util_1.promisify(fs_1.unlink);
/**
 * High-level API to interact with an FTP server.
 */
class Client {
    /**
     * Instantiate an FTP client.
     *
     * @param timeout  Timeout in milliseconds, use 0 for no timeout. Optional, default is 30 seconds.
     */
    constructor(timeout = 30000) {
        /**
         * Multiple commands to retrieve a directory listing are possible. This instance
         * will try all of them in the order presented the first time a directory listing
         * is requested. After that, `availableListCommands` will  hold only the first
         * entry that worked.
         */
        this.availableListCommands = ["MLSD", "LIST -a", "LIST"];
        this.ftp = new FtpContext_1.FTPContext(timeout);
        this.prepareTransfer = this._enterFirstCompatibleMode([transfer_1.enterPassiveModeIPv6, transfer_1.enterPassiveModeIPv4]);
        this.parseList = parseList_1.parseList;
        this._progressTracker = new ProgressTracker_1.ProgressTracker();
    }
    /**
     * Close the client and all open socket connections.
     *
     * Close the client and all open socket connections. The client can’t be used anymore after calling this method,
     * you have to either reconnect with `access` or `connect` or instantiate a new instance to continue any work.
     * A client is also closed automatically if any timeout or connection error occurs.
     */
    close() {
        this.ftp.close();
        this._progressTracker.stop();
    }
    /**
     * Returns true if the client is closed and can't be used anymore.
     */
    get closed() {
        return this.ftp.closed;
    }
    /**
     * Connect (or reconnect) to an FTP server.
     *
     * This is an instance method and thus can be called multiple times during the lifecycle of a `Client`
     * instance. Whenever you do, the client is reset with a new control connection. This also implies that
     * you can reopen a `Client` instance that has been closed due to an error when reconnecting with this
     * method. In fact, reconnecting is the only way to continue using a closed `Client`.
     *
     * @param host  Host the client should connect to. Optional, default is "localhost".
     * @param port  Port the client should connect to. Optional, default is 21.
     */
    connect(host = "localhost", port = 21) {
        this.ftp.reset();
        this.ftp.socket.connect({
            host,
            port,
            family: this.ftp.ipFamily
        }, () => this.ftp.log(`Connected to ${netUtils_1.describeAddress(this.ftp.socket)}`));
        return this.ftp.handle(undefined, (res, task) => {
            if (res instanceof Error) {
                // The connection has been destroyed by the FTPContext at this point.
                task.reject(res);
            }
            else if (parseControlResponse_1.positiveCompletion(res.code)) {
                task.resolve(res);
            }
            // Reject all other codes, including 120 "Service ready in nnn minutes".
            else {
                // Don't stay connected but don't replace the socket yet by using reset()
                // so the user can inspect properties of this instance.
                this.ftp.socket.destroy();
                task.reject(new FtpContext_1.FTPError(res));
            }
        });
    }
    /**
     * Send an FTP command and handle the first response.
     */
    send(command, ignoreErrorCodesDEPRECATED = false) {
        if (ignoreErrorCodesDEPRECATED) { // Deprecated starting from 3.9.0
            this.ftp.log("Deprecated call using send(command, flag) with boolean flag to ignore errors. Use sendIgnoringError(command).");
            return this.sendIgnoringError(command);
        }
        return this.ftp.request(command);
    }
    /**
     * Send an FTP command and ignore an FTP error response. Any other kind of error or timeout will still reject the Promise.
     *
     * @param command
     */
    sendIgnoringError(command) {
        return this.ftp.handle(command, (res, task) => {
            if (res instanceof FtpContext_1.FTPError) {
                task.resolve({ code: res.code, message: res.message });
            }
            else if (res instanceof Error) {
                task.reject(res);
            }
            else {
                task.resolve(res);
            }
        });
    }
    /**
     * Upgrade the current socket connection to TLS.
     *
     * @param options  TLS options as in `tls.connect(options)`, optional.
     * @param command  Set the authentication command. Optional, default is "AUTH TLS".
     */
    async useTLS(options = {}, command = "AUTH TLS") {
        const ret = await this.send(command);
        this.ftp.socket = await netUtils_1.upgradeSocket(this.ftp.socket, options);
        this.ftp.tlsOptions = options; // Keep the TLS options for later data connections that should use the same options.
        this.ftp.log(`Control socket is using: ${netUtils_1.describeTLS(this.ftp.socket)}`);
        return ret;
    }
    /**
     * Login a user with a password.
     *
     * @param user  Username to use for login. Optional, default is "anonymous".
     * @param password  Password to use for login. Optional, default is "guest".
     */
    login(user = "anonymous", password = "guest") {
        this.ftp.log(`Login security: ${netUtils_1.describeTLS(this.ftp.socket)}`);
        return this.ftp.handle("USER " + user, (res, task) => {
            if (res instanceof Error) {
                task.reject(res);
            }
            else if (parseControlResponse_1.positiveCompletion(res.code)) { // User logged in proceed OR Command superfluous
                task.resolve(res);
            }
            else if (res.code === 331) { // User name okay, need password
                this.ftp.send("PASS " + password);
            }
            else { // Also report error on 332 (Need account)
                task.reject(new FtpContext_1.FTPError(res));
            }
        });
    }
    /**
     * Set the usual default settings.
     *
     * Settings used:
     * * Binary mode (TYPE I)
     * * File structure (STRU F)
     * * Additional settings for FTPS (PBSZ 0, PROT P)
     */
    async useDefaultSettings() {
        await this.send("TYPE I"); // Binary mode
        await this.sendIgnoringError("STRU F"); // Use file structure
        await this.sendIgnoringError("OPTS UTF8 ON"); // Some servers expect UTF-8 to be enabled explicitly
        await this.sendIgnoringError("OPTS MLST type;size;modify;unique;unix.mode;unix.owner;unix.group;unix.ownername;unix.groupname;"); // Make sure MLSD listings include all we can parse
        if (this.ftp.hasTLS) {
            await this.sendIgnoringError("PBSZ 0"); // Set to 0 for TLS
            await this.sendIgnoringError("PROT P"); // Protect channel (also for data connections)
        }
    }
    /**
     * Convenience method that calls `connect`, `useTLS`, `login` and `useDefaultSettings`.
     *
     * This is an instance method and thus can be called multiple times during the lifecycle of a `Client`
     * instance. Whenever you do, the client is reset with a new control connection. This also implies that
     * you can reopen a `Client` instance that has been closed due to an error when reconnecting with this
     * method. In fact, reconnecting is the only way to continue using a closed `Client`.
     */
    async access(options = {}) {
        const welcome = await this.connect(options.host, options.port);
        if (options.secure === true) {
            await this.useTLS(options.secureOptions);
        }
        await this.login(options.user, options.password);
        await this.useDefaultSettings();
        return welcome;
    }
    /**
     * Get the current working directory.
     */
    async pwd() {
        const res = await this.send("PWD");
        // The directory is part of the return message, for example:
        // 257 "/this/that" is current directory.
        const parsed = res.message.match(/"(.+)"/);
        if (parsed === null || parsed[1] === undefined) {
            throw new Error(`Can't parse response to command 'PWD': ${res.message}`);
        }
        return parsed[1];
    }
    /**
     * Get a description of supported features.
     *
     * This sends the FEAT command and parses the result into a Map where keys correspond to available commands
     * and values hold further information. Be aware that your FTP servers might not support this
     * command in which case this method will not throw an exception but just return an empty Map.
     */
    async features() {
        const res = await this.sendIgnoringError("FEAT");
        const features = new Map();
        // Not supporting any special features will be reported with a single line.
        if (res.code < 400 && parseControlResponse_1.isMultiline(res.message)) {
            // The first and last line wrap the multiline response, ignore them.
            res.message.split("\n").slice(1, -1).forEach(line => {
                // A typical lines looks like: " REST STREAM" or " MDTM".
                // Servers might not use an indentation though.
                const entry = line.trim().split(" ");
                features.set(entry[0], entry[1] || "");
            });
        }
        return features;
    }
    /**
     * Set the working directory.
     */
    async cd(path) {
        const validPath = await this.protectWhitespace(path);
        return this.send("CWD " + validPath);
    }
    /**
     * Switch to the parent directory of the working directory.
     */
    async cdup() {
        return this.send("CDUP");
    }
    /**
     * Get the last modified time of a file. This is not supported by every FTP server, in which case
     * calling this method will throw an exception.
     */
    async lastMod(path) {
        const validPath = await this.protectWhitespace(path);
        const res = await this.send(`MDTM ${validPath}`);
        const date = res.message.slice(4);
        return parseListMLSD_1.parseMLSxDate(date);
    }
    /**
     * Get the size of a file.
     */
    async size(path) {
        const validPath = await this.protectWhitespace(path);
        const command = `SIZE ${validPath}`;
        const res = await this.send(command);
        // The size is part of the response message, for example: "213 555555". It's
        // possible that there is a commmentary appended like "213 5555, some commentary".
        const size = parseInt(res.message.slice(4), 10);
        if (Number.isNaN(size)) {
            throw new Error(`Can't parse response to command '${command}' as a numerical value: ${res.message}`);
        }
        return size;
    }
    /**
     * Rename a file.
     *
     * Depending on the FTP server this might also be used to move a file from one
     * directory to another by providing full paths.
     */
    async rename(srcPath, destPath) {
        const validSrc = await this.protectWhitespace(srcPath);
        const validDest = await this.protectWhitespace(destPath);
        await this.send("RNFR " + validSrc);
        return this.send("RNTO " + validDest);
    }
    /**
     * Remove a file from the current working directory.
     *
     * You can ignore FTP error return codes which won't throw an exception if e.g.
     * the file doesn't exist.
     */
    async remove(path, ignoreErrorCodes = false) {
        const validPath = await this.protectWhitespace(path);
        return this.send(`DELE ${validPath}`, ignoreErrorCodes);
    }
    /**
     * Report transfer progress for any upload or download to a given handler.
     *
     * This will also reset the overall transfer counter that can be used for multiple transfers. You can
     * also call the function without a handler to stop reporting to an earlier one.
     *
     * @param handler  Handler function to call on transfer progress.
     */
    trackProgress(handler) {
        this._progressTracker.bytesOverall = 0;
        this._progressTracker.reportTo(handler);
    }
    /**
     * Upload data from a readable stream or a local file to a remote file.
     *
     * @param source  Readable stream or path to a local file.
     * @param toRemotePath  Path to a remote file to write to.
     */
    async uploadFrom(source, toRemotePath, options = {}) {
        return this._uploadWithCommand(source, toRemotePath, "STOR", options);
    }
    /**
     * Upload data from a readable stream or a local file by appending it to an existing file. If the file doesn't
     * exist the FTP server should create it.
     *
     * @param source  Readable stream or path to a local file.
     * @param toRemotePath  Path to a remote file to write to.
     */
    async appendFrom(source, toRemotePath, options = {}) {
        return this._uploadWithCommand(source, toRemotePath, "APPE", options);
    }
    /**
     * @protected
     */
    async _uploadWithCommand(source, remotePath, command, options) {
        if (typeof source === "string") {
            return this._uploadLocalFile(source, remotePath, command, options);
        }
        return this._uploadFromStream(source, remotePath, command);
    }
    /**
     * @protected
     */
    async _uploadLocalFile(localPath, remotePath, command, options) {
        const fd = await fsOpen(localPath, "r");
        const source = fs_1.createReadStream("", {
            fd,
            start: options.localStart,
            end: options.localEndInclusive,
            autoClose: false
        });
        try {
            return await this._uploadFromStream(source, remotePath, command);
        }
        finally {
            await ignoreError(() => fsClose(fd));
        }
    }
    /**
     * @protected
     */
    async _uploadFromStream(source, remotePath, command) {
        const onError = (err) => this.ftp.closeWithError(err);
        source.once("error", onError);
        try {
            const validPath = await this.protectWhitespace(remotePath);
            await this.prepareTransfer(this.ftp);
            // Keep the keyword `await` or the `finally` clause below runs too early
            // and removes the event listener for the source stream too early.
            return await transfer_1.uploadFrom(source, {
                ftp: this.ftp,
                tracker: this._progressTracker,
                command,
                remotePath: validPath,
                type: "upload"
            });
        }
        finally {
            source.removeListener("error", onError);
        }
    }
    /**
     * Download a remote file and pipe its data to a writable stream or to a local file.
     *
     * You can optionally define at which position of the remote file you'd like to start
     * downloading. If the destination you provide is a file, the offset will be applied
     * to it as well. For example: To resume a failed download, you'd request the size of
     * the local, partially downloaded file and use that as the offset. Assuming the size
     * is 23, you'd download the rest using `downloadTo("local.txt", "remote.txt", 23)`.
     *
     * @param destination  Stream or path for a local file to write to.
     * @param fromRemotePath  Path of the remote file to read from.
     * @param startAt  Position within the remote file to start downloading at. If the destination is a file, this offset is also applied to it.
     */
    async downloadTo(destination, fromRemotePath, startAt = 0) {
        if (typeof destination === "string") {
            return this._downloadToFile(destination, fromRemotePath, startAt);
        }
        return this._downloadToStream(destination, fromRemotePath, startAt);
    }
    /**
     * @protected
     */
    async _downloadToFile(localPath, remotePath, startAt) {
        const appendingToLocalFile = startAt > 0;
        const fileSystemFlags = appendingToLocalFile ? "r+" : "w";
        const fd = await fsOpen(localPath, fileSystemFlags);
        const destination = fs_1.createWriteStream("", {
            fd,
            start: startAt,
            autoClose: false
        });
        try {
            return await this._downloadToStream(destination, remotePath, startAt);
        }
        catch (err) {
            const localFileStats = await ignoreError(() => fsStat(localPath));
            const hasDownloadedData = localFileStats && localFileStats.size > 0;
            const shouldRemoveLocalFile = !appendingToLocalFile && !hasDownloadedData;
            if (shouldRemoveLocalFile) {
                await ignoreError(() => fsUnlink(localPath));
            }
            throw err;
        }
        finally {
            await ignoreError(() => fsClose(fd));
        }
    }
    /**
     * @protected
     */
    async _downloadToStream(destination, remotePath, startAt) {
        const onError = (err) => this.ftp.closeWithError(err);
        destination.once("error", onError);
        try {
            const validPath = await this.protectWhitespace(remotePath);
            await this.prepareTransfer(this.ftp);
            // Keep the keyword `await` or the `finally` clause below runs too early
            // and removes the event listener for the source stream too early.
            return await transfer_1.downloadTo(destination, {
                ftp: this.ftp,
                tracker: this._progressTracker,
                command: startAt > 0 ? `REST ${startAt}` : `RETR ${validPath}`,
                remotePath: validPath,
                type: "download"
            });
        }
        finally {
            destination.removeListener("error", onError);
            destination.end();
        }
    }
    /**
     * List files and directories in the current working directory, or from `path` if specified.
     *
     * @param [path]  Path to remote file or directory.
     */
    async list(path = "") {
        const validPath = await this.protectWhitespace(path);
        let lastError;
        for (const candidate of this.availableListCommands) {
            const command = `${candidate} ${validPath}`.trim();
            await this.prepareTransfer(this.ftp);
            try {
                const parsedList = await this._requestListWithCommand(command);
                // Use successful candidate for all subsequent requests.
                this.availableListCommands = [candidate];
                return parsedList;
            }
            catch (err) {
                const shouldTryNext = err instanceof FtpContext_1.FTPError;
                if (!shouldTryNext) {
                    throw err;
                }
                lastError = err;
            }
        }
        throw lastError;
    }
    /**
     * @protected
     */
    async _requestListWithCommand(command) {
        const buffer = new StringWriter_1.StringWriter();
        await transfer_1.downloadTo(buffer, {
            ftp: this.ftp,
            tracker: this._progressTracker,
            command,
            remotePath: "",
            type: "list"
        });
        const text = buffer.getText(this.ftp.encoding);
        this.ftp.log(text);
        return this.parseList(text);
    }
    /**
     * Remove a directory and all of its content.
     *
     * @param remoteDirPath  The path of the remote directory to delete.
     * @example client.removeDir("foo") // Remove directory 'foo' using a relative path.
     * @example client.removeDir("foo/bar") // Remove directory 'bar' using a relative path.
     * @example client.removeDir("/foo/bar") // Remove directory 'bar' using an absolute path.
     * @example client.removeDir("/") // Remove everything.
     */
    async removeDir(remoteDirPath) {
        return this._exitAtCurrentDirectory(async () => {
            await this.cd(remoteDirPath);
            await this.clearWorkingDir();
            if (remoteDirPath !== "/") {
                await this.cdup();
                await this.removeEmptyDir(remoteDirPath);
            }
        });
    }
    /**
     * Remove all files and directories in the working directory without removing
     * the working directory itself.
     */
    async clearWorkingDir() {
        for (const file of await this.list()) {
            if (file.isDirectory) {
                await this.cd(file.name);
                await this.clearWorkingDir();
                await this.cdup();
                await this.removeEmptyDir(file.name);
            }
            else {
                await this.remove(file.name);
            }
        }
    }
    /**
     * Upload the contents of a local directory to the remote working directory.
     *
     * This will overwrite existing files with the same names and reuse existing directories.
     * Unrelated files and directories will remain untouched. You can optionally provide a `remoteDirPath`
     * to put the contents inside a directory which will be created if necessary including all
     * intermediate directories. If you did provide a remoteDirPath the working directory will stay
     * the same as before calling this method.
     *
     * @param localDirPath  Local path, e.g. "foo/bar" or "../test"
     * @param [remoteDirPath]  Remote path of a directory to upload to. Working directory if undefined.
     */
    async uploadFromDir(localDirPath, remoteDirPath) {
        return this._exitAtCurrentDirectory(async () => {
            if (remoteDirPath) {
                await this.ensureDir(remoteDirPath);
            }
            return await this._uploadToWorkingDir(localDirPath);
        });
    }
    /**
     * @protected
     */
    async _uploadToWorkingDir(localDirPath) {
        const files = await fsReadDir(localDirPath);
        for (const file of files) {
            const fullPath = path_1.join(localDirPath, file);
            const stats = await fsStat(fullPath);
            if (stats.isFile()) {
                await this.uploadFrom(fullPath, file);
            }
            else if (stats.isDirectory()) {
                await this._openDir(file);
                await this._uploadToWorkingDir(fullPath);
                await this.cdup();
            }
        }
    }
    /**
     * Download all files and directories of the working directory to a local directory.
     *
     * @param localDirPath  The local directory to download to.
     * @param remoteDirPath  Remote directory to download. Current working directory if not specified.
     */
    async downloadToDir(localDirPath, remoteDirPath) {
        return this._exitAtCurrentDirectory(async () => {
            if (remoteDirPath) {
                await this.cd(remoteDirPath);
            }
            return await this._downloadFromWorkingDir(localDirPath);
        });
    }
    /**
     * @protected
     */
    async _downloadFromWorkingDir(localDirPath) {
        await ensureLocalDirectory(localDirPath);
        for (const file of await this.list()) {
            const localPath = path_1.join(localDirPath, file.name);
            if (file.isDirectory) {
                await this.cd(file.name);
                await this._downloadFromWorkingDir(localPath);
                await this.cdup();
            }
            else if (file.isFile) {
                await this.downloadTo(localPath, file.name);
            }
        }
    }
    /**
     * Make sure a given remote path exists, creating all directories as necessary.
     * This function also changes the current working directory to the given path.
     */
    async ensureDir(remoteDirPath) {
        // If the remoteDirPath was absolute go to root directory.
        if (remoteDirPath.startsWith("/")) {
            await this.cd("/");
        }
        const names = remoteDirPath.split("/").filter(name => name !== "");
        for (const name of names) {
            await this._openDir(name);
        }
    }
    /**
     * Try to create a directory and enter it. This will not raise an exception if the directory
     * couldn't be created if for example it already exists.
     * @protected
     */
    async _openDir(dirName) {
        await this.sendIgnoringError("MKD " + dirName);
        await this.cd(dirName);
    }
    /**
     * Remove an empty directory, will fail if not empty.
     */
    async removeEmptyDir(path) {
        const validPath = await this.protectWhitespace(path);
        return this.send(`RMD ${validPath}`);
    }
    /**
     * FTP servers can't handle filenames that have leading whitespace. This method transforms
     * a given path to fix that issue for most cases.
     */
    async protectWhitespace(path) {
        if (!path.startsWith(" ")) {
            return path;
        }
        // Handle leading whitespace by prepending the absolute path:
        // " test.txt" while being in the root directory becomes "/ test.txt".
        const pwd = await this.pwd();
        const absolutePathPrefix = pwd.endsWith("/") ? pwd : pwd + "/";
        return absolutePathPrefix + path;
    }
    async _exitAtCurrentDirectory(func) {
        const userDir = await this.pwd();
        try {
            return await func();
        }
        finally {
            if (!this.closed) {
                await ignoreError(() => this.cd(userDir));
            }
        }
    }
    /**
     * Try all available transfer strategies and pick the first one that works. Update `client` to
     * use the working strategy for all successive transfer requests.
     *
     * @param strategies
     * @returns a function that will try the provided strategies.
     */
    _enterFirstCompatibleMode(strategies) {
        return async (ftp) => {
            ftp.log("Trying to find optimal transfer strategy...");
            for (const strategy of strategies) {
                try {
                    const res = await strategy(ftp);
                    ftp.log("Optimal transfer strategy found.");
                    this.prepareTransfer = strategy; // eslint-disable-line require-atomic-updates
                    return res;
                }
                catch (err) {
                    // Receiving an FTPError means that the last transfer strategy failed and we should
                    // try the next one. Any other exception should stop the evaluation of strategies because
                    // something else went wrong.
                    if (!(err instanceof FtpContext_1.FTPError)) {
                        throw err;
                    }
                }
            }
            throw new Error("None of the available transfer strategies work.");
        };
    }
    /**
     * DEPRECATED, use `uploadFrom`.
     * @deprecated
     */
    async upload(source, toRemotePath, options = {}) {
        this.ftp.log("Warning: upload() has been deprecated, use uploadFrom().");
        return this.uploadFrom(source, toRemotePath, options);
    }
    /**
     * DEPRECATED, use `appendFrom`.
     * @deprecated
     */
    async append(source, toRemotePath, options = {}) {
        this.ftp.log("Warning: append() has been deprecated, use appendFrom().");
        return this.appendFrom(source, toRemotePath, options);
    }
    /**
     * DEPRECATED, use `downloadTo`.
     * @deprecated
     */
    async download(destination, fromRemotePath, startAt = 0) {
        this.ftp.log("Warning: download() has been deprecated, use downloadTo().");
        return this.downloadTo(destination, fromRemotePath, startAt);
    }
    /**
     * DEPRECATED, use `uploadFromDir`.
     * @deprecated
     */
    async uploadDir(localDirPath, remoteDirPath) {
        this.ftp.log("Warning: uploadDir() has been deprecated, use uploadFromDir().");
        return this.uploadFromDir(localDirPath, remoteDirPath);
    }
    /**
     * DEPRECATED, use `downloadToDir`.
     * @deprecated
     */
    async downloadDir(localDirPath) {
        this.ftp.log("Warning: downloadDir() has been deprecated, use downloadToDir().");
        return this.downloadToDir(localDirPath);
    }
}
exports.Client = Client;
async function ensureLocalDirectory(path) {
    try {
        await fsStat(path);
    }
    catch (err) {
        await fsMkDir(path, { recursive: true });
    }
}
async function ignoreError(func) {
    try {
        return await func();
    }
    catch (err) {
        // Ignore
        return undefined;
    }
}


/***/ })

/******/ });