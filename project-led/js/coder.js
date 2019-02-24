'use strict';

var Code = {};

/**
 * Lookup for names of supported languages.  Keys should be in ISO 639 format.
 */
Code.LANGUAGE_NAME = {
    'en': 'English',
    'zh-hant': '正體中文'
};

/**
 * List of RTL languages.
 */
Code.LANGUAGE_RTL = ['ar', 'fa', 'he', 'lki'];

/**
 * Blockly's main workspace.
 * @type {Blockly.WorkspaceSvg}
 */
Code.workspace = null;

/**
 * Extracts a parameter from the URL.
 * If the parameter is absent default_value is returned.
 * @param {string} name The name of the parameter.
 * @param {string} defaultValue Value to return if paramater not found.
 * @return {string} The parameter value or the default value if not found.
 */
Code.getStringParamFromUrl = function (name, defaultValue) {
    var val = location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
    return val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : defaultValue;
};

/**
 * Get the language of this user from the URL.
 * @return {string} User's language.
 */
Code.getLang = function () {
    var lang = Code.getStringParamFromUrl('lang', '');
    if (Code.LANGUAGE_NAME[lang] === undefined) {
        lang = 'zh-hant';
    }
    return lang;
};

/**
 * Is the current language (Code.LANG) an RTL language?
 * @return {boolean} True if RTL, false if LTR.
 */
Code.isRtl = function () {
    return Code.LANGUAGE_RTL.indexOf(Code.LANG) != -1;
};

/**
 * Initialize the page language.
 */
Code.initLanguage = function () {
    // Set the HTML's language and direction.
    var rtl = Code.isRtl();
    document.dir = rtl ? 'rtl' : 'ltr';
    document.head.parentElement.setAttribute('lang', Code.LANG);

    // Sort languages alphabetically.
    var languages = [];
    for (var lang in Code.LANGUAGE_NAME) {
        languages.push([Code.LANGUAGE_NAME[lang], lang]);
    }
    var comp = function (a, b) {
        // Sort based on first argument ('English', 'Русский', '简体字', etc).
        if (a[0] > b[0]) return 1;
        if (a[0] < b[0]) return -1;
        return 0;
    };
    languages.sort(comp);
};

Code.getGeneratedScript = function () {
    let code = Blockly.JavaScript.workspaceToCode(Code.workspace);
    let fullCode = `const constValue = require('../common/constValue');
const ledManager = require('../common/ledManager');
const config = require('../config');
const runtimeValue = require('../runtimeValue');

${code}
module.exports = {
    run: run
};
`;
    return document.createTextNode(fullCode);
}

Code.onUpdated = function (event) {
    var codeDiv = document.getElementById('codeDiv');
    var codeHolder = document.createElement('pre');
    codeHolder.className = 'prettyprint but-not-that-pretty';
    var code = Code.getGeneratedScript();
    codeHolder.appendChild(code);
    codeDiv.replaceChild(codeHolder, codeDiv.lastElementChild);
    prettyPrint();
};

Code.saveToFile = function () {
    console.log('saveToFile');
    
};

/**
 * User's language (e.g. "en").
 * @type {string}
 */
Code.LANG = Code.getLang();

Code.init = function () {
    document.getElementById('saveButton').addEventListener('click', Code.saveToFile);
    // document.getElementById('saveBlockButton').addEventListener('click', Code.saveBlocksToXml);

    Code.initLanguage();

    var rtl = Code.isRtl();

    var toolboxText = document.getElementById('toolbox').outerHTML;
    toolboxText = toolboxText.replace(/{(\w+)}/g,
        function (m, p1) {
            return MSG[p1]
        });
    var toolboxXml = Blockly.Xml.textToDom(toolboxText);

    var workspace = Blockly.inject('blocklyDiv', {
        toolbox: toolboxXml,
        rtl: rtl,
        trashcan: true,
        grid: {
            spacing: 25,
            length: 3,
            colour: '#ccc',
            snap: true
        },
        zoom: {
            controls: true,
            wheel: true
        },
        media: 'blockly/media/'
    });
    Blockly.Xml.domToWorkspace(document.getElementById('startBlocks'),
        workspace);
    workspace.addChangeListener(Code.onUpdated);

    Code.workspace = workspace;
};

// Load the Code demo's language strings.
document.write('<script src="msg/' + Code.LANG + '.js"></script>\n');
// Load Blockly's language strings.
document.write('<script src="blockly/msg/js/' + Code.LANG + '.js"></script>\n');
