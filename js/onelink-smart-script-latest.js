/**
 * AF Smart Script (Build 2.4.0)
 */

//客定需要将产出的所有parameter，举例，按字母顺序排序； 可以自由实现想要的顺序

function getObjectKeysAlphabetical(o) {
  var sorted = {},
  key, a = [];

  for (key in o) {
      if (o.hasOwnProperty(key)) {
          a.push(key);
      }
  }

  a.sort();

  for (key = 0; key < a.length; key++) {
      sorted[a[key]] = o[a[key]];
  }
  return sorted;
}



function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }

  return target;
}

function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var AF_URL_SCHEME = '(https:\\/\\/)(([^\\.]+).)(.*\\/)(.*)';
var VALID_AF_URL_PARTS_LENGTH = 5;
var GOOGLE_CLICK_ID = 'gclid';
var ASSOCIATED_AD_KEYWORD = 'keyword';
var AF_KEYWORDS = 'af_keywords';
var AF_CUSTOM_EXCLUDE_PARAMS_KEYS = ['pid', 'c', 'af_channel', 'af_ad', 'af_adset', 'deep_link_value', 'af_sub1', 'af_sub2', 'af_sub3', 'af_sub4', 'af_sub5'];
var GCLID_EXCLUDE_PARAMS_KEYS = ['pid', 'c', 'af_channel', 'af_ad', 'af_adset', 'deep_link_value'];

var isSkippedURL = function isSkippedURL(_ref) {
  var url = _ref.url,
      skipKeys = _ref.skipKeys,
      errorMsg = _ref.errorMsg;

  // search if this page referred and contains one of the given keys
  if (url) {
    var lowerURL = url.toLowerCase();

    if (lowerURL) {
      var skipKey = skipKeys.find(function (key) {
        return lowerURL.includes(key.toLowerCase());
      });
      !!skipKey && console.debug(errorMsg, skipKey);
      return !!skipKey;
    }
  }

  return false;
};

var getGoogleClickIdParameters = function getGoogleClickIdParameters(gciKey, currentURLParams) {
  var gciParam = currentURLParams[GOOGLE_CLICK_ID];
  var result = {};

  if (gciParam) {
    console.debug('This user comes from Google AdWords');
    result[gciKey] = gciParam;
    var keywordParam = currentURLParams[ASSOCIATED_AD_KEYWORD];

    if (keywordParam) {
      console.debug('There is a keyword associated with the ad');
      result[AF_KEYWORDS] = keywordParam;
    }
  } else {
    console.debug('This user comes from SRN or custom network');
  }

  return result;
};

var stringifyParameters = function stringifyParameters() {
  var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var orderedParam = getObjectKeysAlphabetical(parameters);
  var paramStr = Object.keys(orderedParam).reduce(function (curr, key) {  
    if (orderedParam[key]) {
      curr += "&".concat(key, "=").concat(orderedParam[key]);
    }

    return curr;
  }, '');
  console.debug('Generated OneLink parameters', orderedParam);
  return paramStr;
};

var getParameterValue = function getParameterValue(currentURLParams) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    keys: [],
    overrideValues: {},
    defaultValue: ''
  };

  //exit when config object structure is not valid
  if (!(config !== null && config !== void 0 && config.keys && Array.isArray(config.keys) || config !== null && config !== void 0 && config.defaultValue)) {
    console.error('Parameter config structure is wrong', config);
    return null;
  }

  var _config$keys = config.keys,
      keys = _config$keys === void 0 ? [] : _config$keys,
      _config$overrideValue = config.overrideValues,
      overrideValues = _config$overrideValue === void 0 ? {} : _config$overrideValue,
      _config$defaultValue = config.defaultValue,
      defaultValue = _config$defaultValue === void 0 ? '' : _config$defaultValue;
  var firstMatchedKey = keys.find(function (key) {
    //set the first match of key which contains also a value
    return !!currentURLParams[key];
  });

  if (firstMatchedKey) {
    var value = currentURLParams[firstMatchedKey]; //in case the value exists:
    //check if it exists in the overrideValues object, when exists - replace it
    //otherwise return default value

    return overrideValues[value] || value || defaultValue;
  }

  return defaultValue;
};

var getURLParametersKV = function getURLParametersKV(urlSearch) {
  var currentURLParams = urlSearch.replace('?', '').split('&').reduce(function (curr, param) {
    var kv = param.split('=');

    if (!!kv[0] && !!kv[1]) {
      curr[[kv[0]]] = kv[1];
    }
 
    return curr;
  }, {});
  console.debug('Generated current parameters object', currentURLParams);
  return currentURLParams;
};

var isIOS = function isIOS(useragent) {
  return /iphone|ipad|ipod/i.test(useragent && useragent.toLowerCase());
};

var isUACHSupported = function isUACHSupported() {
  return (typeof navigator === "undefined" ? "undefined" : _typeof(navigator)) === 'object' && 'userAgentData' in navigator && 'getHighEntropyValues' in navigator.userAgentData && !isIOS(navigator && navigator.userAgent);
};

var isOneLinkURLValid = function isOneLinkURLValid(oneLinkURL) {
  var _ref;

  var oneLinkURLParts = (_ref = oneLinkURL || '') === null || _ref === void 0 ? void 0 : _ref.toString().match(AF_URL_SCHEME);

  if (!oneLinkURLParts || (oneLinkURLParts === null || oneLinkURLParts === void 0 ? void 0 : oneLinkURLParts.length) < VALID_AF_URL_PARTS_LENGTH) {
    console.error("oneLinkURL is missing or not in the correct format, can't generate URL", oneLinkURL);
    return false;
  }

  return true;
};

var validatedMs = function validatedMs() {
  var _mediaSource$keys;

  var mediaSource = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if ((mediaSource === null || mediaSource === void 0 ? void 0 : (_mediaSource$keys = mediaSource.keys) === null || _mediaSource$keys === void 0 ? void 0 : _mediaSource$keys.length) === 0 && !(mediaSource !== null && mediaSource !== void 0 && mediaSource.defaultValue)) {
    console.error("mediaSource is missing (default value was not supplied), can't generate URL", mediaSource);
    return false;
  }

  return true;
};

var isSkipListsValid = function isSkipListsValid(_ref2) {
  var _ref2$referrerSkipLis = _ref2.referrerSkipList,
      referrerSkipList = _ref2$referrerSkipLis === void 0 ? [] : _ref2$referrerSkipLis,
      _ref2$urlSkipList = _ref2.urlSkipList,
      urlSkipList = _ref2$urlSkipList === void 0 ? [] : _ref2$urlSkipList;

  if (isSkippedURL({
    url: document.referrer,
    skipKeys: referrerSkipList,
    errorMsg: 'Generate url is skipped. HTTP referrer contains key:'
  })) {
    return false;
  }

  if (isSkippedURL({
    url: document.URL,
    skipKeys: urlSkipList,
    errorMsg: 'Generate url is skipped. URL contains string:'
  })) {
    return false;
  }

  return true;
};

var extractCustomParams = function extractCustomParams(_ref3) {
  var _ref3$afCustom = _ref3.afCustom,
      afCustom = _ref3$afCustom === void 0 ? [] : _ref3$afCustom,
      _ref3$currentURLParam = _ref3.currentURLParams,
      currentURLParams = _ref3$currentURLParam === void 0 ? {} : _ref3$currentURLParam,
      googleClickIdKey = _ref3.googleClickIdKey;
  var afParams = {};

  if (Array.isArray(afCustom)) {
    afCustom.forEach(function (customParam) {
      if (customParam !== null && customParam !== void 0 && customParam.paramKey) {
        var isOverrideExistingKey = AF_CUSTOM_EXCLUDE_PARAMS_KEYS.find(function (k) {
          return k === (customParam === null || customParam === void 0 ? void 0 : customParam.paramKey);
        });

        if ((customParam === null || customParam === void 0 ? void 0 : customParam.paramKey) === googleClickIdKey || isOverrideExistingKey) {
          console.debug("Custom parameter ParamKey can't override Google-Click-Id or AF Parameters keys", customParam);
        } else {
          afParams[customParam.paramKey] = getParameterValue(currentURLParams, customParam);
        }
      }
    });
  }

  return afParams;
};

var validateAndMappedParams = function validateAndMappedParams() {
  var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var currentURLParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var isDirectClick = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var mediaSource = params.mediaSource,
      campaign = params.campaign,
      channel = params.channel,
      ad = params.ad,
      adSet = params.adSet,
      deepLinkValue = params.deepLinkValue,
      afSub1 = params.afSub1,
      afSub2 = params.afSub2,
      afSub3 = params.afSub3,
      afSub4 = params.afSub4,
      afSub5 = params.afSub5,
      afCustom = params.afCustom,
      googleClickIdKey = params.googleClickIdKey;
  var afParams = {}; // Validates the URL and returns `true` if it should be skipped, `false` otherwise.

  if (mediaSource) {
    var pidValue = getParameterValue(currentURLParams, mediaSource);

    if (!pidValue) {
      console.error("mediaSource was not found in the URL and default value was not supplied, can't generate URL", mediaSource);
      return null;
    }

    var pidParamKey = isDirectClick ? 'af_media_source' : 'pid';
    afParams[pidParamKey] = pidValue;
  }

  if (campaign) {
    var campaignValue = getParameterValue(currentURLParams, campaign);

    if (!campaignValue && isDirectClick) {
      console.error("campaign was not found in the URL and default value was not supplied, can't generate URL", campaign);
      return null;
    }

    if (isDirectClick) {
      afParams['af_campaign'] = campaignValue;
      afParams['af_campaign_id'] = campaignValue;
    } else {
      afParams['c'] = campaignValue;
    }
  }

  if (channel) {
    afParams['af_channel'] = getParameterValue(currentURLParams, channel);
  }

  if (ad) {
    afParams['af_ad'] = getParameterValue(currentURLParams, ad);
  }

  if (adSet) {
    afParams['af_adset'] = getParameterValue(currentURLParams, adSet);
  }

  if (deepLinkValue) {
    afParams['deep_link_value'] = getParameterValue(currentURLParams, deepLinkValue);
  }

  var afSubs = [afSub1, afSub2, afSub3, afSub4, afSub5];
  afSubs.forEach(function (afSub, index) {
    if (afSub) {
      afParams["af_sub".concat(index + 1)] = getParameterValue(currentURLParams, afSub);
    }
  });

  if (googleClickIdKey) {
    if (GCLID_EXCLUDE_PARAMS_KEYS.find(function (k) {
      return k === googleClickIdKey;
    })) {
      console.debug("Google Click Id ParamKey can't override AF Parameters keys", googleClickIdKey);
    } else {
      var googleParameters = getGoogleClickIdParameters(googleClickIdKey, currentURLParams);
      Object.keys(googleParameters).forEach(function (gpk) {
        afParams[gpk] = googleParameters[gpk];
      });
    }
  }

  var customParams = extractCustomParams({
    afCustom: afCustom,
    currentURLParams: currentURLParams,
    googleClickIdKey: googleClickIdKey
  });
  return _objectSpread2(_objectSpread2({}, afParams), customParams);
};

var isPlatformValid = function isPlatformValid(platform) {
  if (!platform) {
    console.error("platform is missing , can't generate URL", platform);
    return false;
  }

  var platforms = ['smartcast', 'tizen', 'roku', 'webos', 'vidaa', 'playstation', 'android', 'ios', 'steam', 'quest', 'battlenet'];

  if (!platforms.includes(platform)) {
    console.error('platform need to be part of the known platforms supoorted');
    return false;
  }

  return true;
};

/**
 * EasyQRCodeJS
 *
 * Cross-browser QRCode generator for pure javascript. Support Canvas, SVG and Table drawing methods. Support Dot style, Logo, Background image, Colorful, Title etc. settings. Support Angular, Vue.js, React, Next.js, Svelte framework. Support binary(hex) data mode.(Running with DOM on client side)
 *
 * Version 4.4.10
 *
 * @author [ inthinkcolor@gmail.com ]
 *
 * @see https://github.com/ushelp/EasyQRCodeJS
 * @see http://www.easyproject.cn/easyqrcodejs/tryit.html
 * @see https://github.com/ushelp/EasyQRCodeJS-NodeJS
 *
 * Copyright 2017 Ray, EasyProject
 * Released under the MIT license
 *
 * [Support AMD, CMD, CommonJS/Node.js]
 *
 */
function QRCode() {

  var undefined$1;
  /** Node.js global 检测. */

  var freeGlobal = (typeof global === "undefined" ? "undefined" : _typeof(global)) == 'object' && global && global.Object === Object && global;
  /** `self` 变量检测. */

  var freeSelf = (typeof self === "undefined" ? "undefined" : _typeof(self)) == 'object' && self && self.Object === Object && self;
  /** 全局对象检测. */

  var root = freeGlobal || freeSelf || Function('return this')();
  /** `exports` 变量检测. */

  var freeExports = (typeof exports === "undefined" ? "undefined" : _typeof(exports)) == 'object' && exports && !exports.nodeType && exports;
  /** `module` 变量检测. */

  var freeModule = freeExports && (typeof module === "undefined" ? "undefined" : _typeof(module)) == 'object' && module && !module.nodeType && module;
  var _QRCode = root.QRCode;
  var QRCode;

  function QR8bitByte(data, binary, utf8WithoutBOM) {
    this.mode = QRMode.MODE_8BIT_BYTE;
    this.data = data;
    this.parsedData = []; // Added to support UTF-8 Characters

    for (var i = 0, l = this.data.length; i < l; i++) {
      var byteArray = [];
      var code = this.data.charCodeAt(i);

      if (binary) {
        byteArray[0] = code;
      } else {
        if (code > 0x10000) {
          byteArray[0] = 0xf0 | (code & 0x1c0000) >>> 18;
          byteArray[1] = 0x80 | (code & 0x3f000) >>> 12;
          byteArray[2] = 0x80 | (code & 0xfc0) >>> 6;
          byteArray[3] = 0x80 | code & 0x3f;
        } else if (code > 0x800) {
          byteArray[0] = 0xe0 | (code & 0xf000) >>> 12;
          byteArray[1] = 0x80 | (code & 0xfc0) >>> 6;
          byteArray[2] = 0x80 | code & 0x3f;
        } else if (code > 0x80) {
          byteArray[0] = 0xc0 | (code & 0x7c0) >>> 6;
          byteArray[1] = 0x80 | code & 0x3f;
        } else {
          byteArray[0] = code;
        }
      }

      this.parsedData.push(byteArray);
    }

    this.parsedData = Array.prototype.concat.apply([], this.parsedData);

    if (!utf8WithoutBOM && this.parsedData.length != this.data.length) {
      this.parsedData.unshift(191);
      this.parsedData.unshift(187);
      this.parsedData.unshift(239);
    }
  }

  QR8bitByte.prototype = {
    getLength: function getLength(buffer) {
      return this.parsedData.length;
    },
    write: function write(buffer) {
      for (var i = 0, l = this.parsedData.length; i < l; i++) {
        buffer.put(this.parsedData[i], 8);
      }
    }
  };

  function QRCodeModel(typeNumber, errorCorrectLevel) {
    this.typeNumber = typeNumber;
    this.errorCorrectLevel = errorCorrectLevel;
    this.modules = null;
    this.moduleCount = 0;
    this.dataCache = null;
    this.dataList = [];
  }

  QRCodeModel.prototype = {
    addData: function addData(data, binary, utf8WithoutBOM) {
      var newData = new QR8bitByte(data, binary, utf8WithoutBOM);
      this.dataList.push(newData);
      this.dataCache = null;
    },
    isDark: function isDark(row, col) {
      if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
        throw new Error(row + ',' + col);
      }

      return this.modules[row][col][0];
    },
    getEye: function getEye(row, col) {
      if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
        throw new Error(row + ',' + col);
      }

      var block = this.modules[row][col]; // [isDark(ture/false), EyeOuterOrInner(O/I), Position(TL/TR/BL/A) ]

      if (block[1]) {
        var type = 'P' + block[1] + '_' + block[2]; //PO_TL, PI_TL, PO_TR, PI_TR, PO_BL, PI_BL

        if (block[2] == 'A') {
          type = 'A' + block[1]; // AI, AO
        }

        return {
          isDark: block[0],
          type: type
        };
      } else {
        return null;
      }
    },
    getModuleCount: function getModuleCount() {
      return this.moduleCount;
    },
    make: function make() {
      this.makeImpl(false, this.getBestMaskPattern());
    },
    makeImpl: function makeImpl(test, maskPattern) {
      this.moduleCount = this.typeNumber * 4 + 17;
      this.modules = new Array(this.moduleCount);

      for (var row = 0; row < this.moduleCount; row++) {
        this.modules[row] = new Array(this.moduleCount);

        for (var col = 0; col < this.moduleCount; col++) {
          this.modules[row][col] = []; // [isDark(ture/false), EyeOuterOrInner(O/I), Position(TL/TR/BL) ]
        }
      }

      this.setupPositionProbePattern(0, 0, 'TL'); // TopLeft, TL

      this.setupPositionProbePattern(this.moduleCount - 7, 0, 'BL'); // BotoomLeft, BL

      this.setupPositionProbePattern(0, this.moduleCount - 7, 'TR'); // TopRight, TR

      this.setupPositionAdjustPattern('A'); // Alignment, A

      this.setupTimingPattern();
      this.setupTypeInfo(test, maskPattern);

      if (this.typeNumber >= 7) {
        this.setupTypeNumber(test);
      }

      if (this.dataCache == null) {
        this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
      }

      this.mapData(this.dataCache, maskPattern);
    },
    setupPositionProbePattern: function setupPositionProbePattern(row, col, posName) {
      for (var r = -1; r <= 7; r++) {
        if (row + r <= -1 || this.moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c++) {
          if (col + c <= -1 || this.moduleCount <= col + c) continue;

          if (0 <= r && r <= 6 && (c == 0 || c == 6) || 0 <= c && c <= 6 && (r == 0 || r == 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) {
            this.modules[row + r][col + c][0] = true;
            this.modules[row + r][col + c][2] = posName; // Position

            if (r == -0 || c == -0 || r == 6 || c == 6) {
              this.modules[row + r][col + c][1] = 'O'; // Position Outer
            } else {
              this.modules[row + r][col + c][1] = 'I'; // Position Inner
            }
          } else {
            this.modules[row + r][col + c][0] = false;
          }
        }
      }
    },
    getBestMaskPattern: function getBestMaskPattern() {
      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i++) {
        this.makeImpl(true, i);
        var lostPoint = QRUtil.getLostPoint(this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    },
    createMovieClip: function createMovieClip(target_mc, instance_name, depth) {
      var qr_mc = target_mc.createEmptyMovieClip(instance_name, depth);
      var cs = 1;
      this.make();

      for (var row = 0; row < this.modules.length; row++) {
        var y = row * cs;

        for (var col = 0; col < this.modules[row].length; col++) {
          var x = col * cs;
          var dark = this.modules[row][col][0];

          if (dark) {
            qr_mc.beginFill(0, 100);
            qr_mc.moveTo(x, y);
            qr_mc.lineTo(x + cs, y);
            qr_mc.lineTo(x + cs, y + cs);
            qr_mc.lineTo(x, y + cs);
            qr_mc.endFill();
          }
        }
      }

      return qr_mc;
    },
    setupTimingPattern: function setupTimingPattern() {
      for (var r = 8; r < this.moduleCount - 8; r++) {
        if (this.modules[r][6][0] != null) {
          continue;
        }

        this.modules[r][6][0] = r % 2 == 0;
      }

      for (var c = 8; c < this.moduleCount - 8; c++) {
        if (this.modules[6][c][0] != null) {
          continue;
        }

        this.modules[6][c][0] = c % 2 == 0;
      }
    },
    setupPositionAdjustPattern: function setupPositionAdjustPattern(posName) {
      var pos = QRUtil.getPatternPosition(this.typeNumber);

      for (var i = 0; i < pos.length; i++) {
        for (var j = 0; j < pos.length; j++) {
          var row = pos[i];
          var col = pos[j];

          if (this.modules[row][col][0] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r++) {
            for (var c = -2; c <= 2; c++) {
              if (r == -2 || r == 2 || c == -2 || c == 2 || r == 0 && c == 0) {
                this.modules[row + r][col + c][0] = true;
                this.modules[row + r][col + c][2] = posName; // Position

                if (r == -2 || c == -2 || r == 2 || c == 2) {
                  this.modules[row + r][col + c][1] = 'O'; // Position Outer
                } else {
                  this.modules[row + r][col + c][1] = 'I'; // Position Inner
                }
              } else {
                this.modules[row + r][col + c][0] = false;
              }
            }
          }
        }
      }
    },
    setupTypeNumber: function setupTypeNumber(test) {
      var bits = QRUtil.getBCHTypeNumber(this.typeNumber);

      for (var i = 0; i < 18; i++) {
        var mod = !test && (bits >> i & 1) == 1;
        this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3][0] = mod;
      }

      for (var i = 0; i < 18; i++) {
        var mod = !test && (bits >> i & 1) == 1;
        this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)][0] = mod;
      }
    },
    setupTypeInfo: function setupTypeInfo(test, maskPattern) {
      var data = this.errorCorrectLevel << 3 | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      for (var i = 0; i < 15; i++) {
        var mod = !test && (bits >> i & 1) == 1;

        if (i < 6) {
          this.modules[i][8][0] = mod;
        } else if (i < 8) {
          this.modules[i + 1][8][0] = mod;
        } else {
          this.modules[this.moduleCount - 15 + i][8][0] = mod;
        }
      }

      for (var i = 0; i < 15; i++) {
        var mod = !test && (bits >> i & 1) == 1;

        if (i < 8) {
          this.modules[8][this.moduleCount - i - 1][0] = mod;
        } else if (i < 9) {
          this.modules[8][15 - i - 1 + 1][0] = mod;
        } else {
          this.modules[8][15 - i - 1][0] = mod;
        }
      }

      this.modules[this.moduleCount - 8][8][0] = !test;
    },
    mapData: function mapData(data, maskPattern) {
      var inc = -1;
      var row = this.moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;

      for (var col = this.moduleCount - 1; col > 0; col -= 2) {
        if (col == 6) col--;

        while (true) {
          for (var c = 0; c < 2; c++) {
            if (this.modules[row][col - c][0] == null) {
              var dark = false;

              if (byteIndex < data.length) {
                dark = (data[byteIndex] >>> bitIndex & 1) == 1;
              }

              var mask = QRUtil.getMask(maskPattern, row, col - c);

              if (mask) {
                dark = !dark;
              }

              this.modules[row][col - c][0] = dark;
              bitIndex--;

              if (bitIndex == -1) {
                byteIndex++;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || this.moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    }
  };
  QRCodeModel.PAD0 = 0xec;
  QRCodeModel.PAD1 = 0x11;

  QRCodeModel.createData = function (typeNumber, errorCorrectLevel, dataList) {
    var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
    var buffer = new QRBitBuffer();

    for (var i = 0; i < dataList.length; i++) {
      var data = dataList[i];
      buffer.put(data.mode, 4);
      buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
      data.write(buffer);
    }

    var totalDataCount = 0;

    for (var i = 0; i < rsBlocks.length; i++) {
      totalDataCount += rsBlocks[i].dataCount;
    }

    if (buffer.getLengthInBits() > totalDataCount * 8) {
      throw new Error('code length overflow. (' + buffer.getLengthInBits() + '>' + totalDataCount * 8 + ')');
    }

    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
      buffer.put(0, 4);
    }

    while (buffer.getLengthInBits() % 8 != 0) {
      buffer.putBit(false);
    }

    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }

      buffer.put(QRCodeModel.PAD0, 8);

      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }

      buffer.put(QRCodeModel.PAD1, 8);
    }

    return QRCodeModel.createBytes(buffer, rsBlocks);
  };

  QRCodeModel.createBytes = function (buffer, rsBlocks) {
    var offset = 0;
    var maxDcCount = 0;
    var maxEcCount = 0;
    var dcdata = new Array(rsBlocks.length);
    var ecdata = new Array(rsBlocks.length);

    for (var r = 0; r < rsBlocks.length; r++) {
      var dcCount = rsBlocks[r].dataCount;
      var ecCount = rsBlocks[r].totalCount - dcCount;
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);
      dcdata[r] = new Array(dcCount);

      for (var i = 0; i < dcdata[r].length; i++) {
        dcdata[r][i] = 0xff & buffer.buffer[i + offset];
      }

      offset += dcCount;
      var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
      var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
      var modPoly = rawPoly.mod(rsPoly);
      ecdata[r] = new Array(rsPoly.getLength() - 1);

      for (var i = 0; i < ecdata[r].length; i++) {
        var modIndex = i + modPoly.getLength() - ecdata[r].length;
        ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
      }
    }

    var totalCodeCount = 0;

    for (var i = 0; i < rsBlocks.length; i++) {
      totalCodeCount += rsBlocks[i].totalCount;
    }

    var data = new Array(totalCodeCount);
    var index = 0;

    for (var i = 0; i < maxDcCount; i++) {
      for (var r = 0; r < rsBlocks.length; r++) {
        if (i < dcdata[r].length) {
          data[index++] = dcdata[r][i];
        }
      }
    }

    for (var i = 0; i < maxEcCount; i++) {
      for (var r = 0; r < rsBlocks.length; r++) {
        if (i < ecdata[r].length) {
          data[index++] = ecdata[r][i];
        }
      }
    }

    return data;
  };

  var QRMode = {
    MODE_NUMBER: 1 << 0,
    MODE_ALPHA_NUM: 1 << 1,
    MODE_8BIT_BYTE: 1 << 2,
    MODE_KANJI: 1 << 3
  };
  var QRErrorCorrectLevel = {
    L: 1,
    M: 0,
    Q: 3,
    H: 2
  };
  var QRMaskPattern = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7
  };
  var QRUtil = {
    PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]],
    G15: 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0,
    G18: 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0,
    G15_MASK: 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1,
    getBCHTypeInfo: function getBCHTypeInfo(data) {
      var d = data << 10;

      while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
        d ^= QRUtil.G15 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15);
      }

      return (data << 10 | d) ^ QRUtil.G15_MASK;
    },
    getBCHTypeNumber: function getBCHTypeNumber(data) {
      var d = data << 12;

      while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
        d ^= QRUtil.G18 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18);
      }

      return data << 12 | d;
    },
    getBCHDigit: function getBCHDigit(data) {
      var digit = 0;

      while (data != 0) {
        digit++;
        data >>>= 1;
      }

      return digit;
    },
    getPatternPosition: function getPatternPosition(typeNumber) {
      return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
    },
    getMask: function getMask(maskPattern, i, j) {
      switch (maskPattern) {
        case QRMaskPattern.PATTERN000:
          return (i + j) % 2 == 0;

        case QRMaskPattern.PATTERN001:
          return i % 2 == 0;

        case QRMaskPattern.PATTERN010:
          return j % 3 == 0;

        case QRMaskPattern.PATTERN011:
          return (i + j) % 3 == 0;

        case QRMaskPattern.PATTERN100:
          return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;

        case QRMaskPattern.PATTERN101:
          return i * j % 2 + i * j % 3 == 0;

        case QRMaskPattern.PATTERN110:
          return (i * j % 2 + i * j % 3) % 2 == 0;

        case QRMaskPattern.PATTERN111:
          return (i * j % 3 + (i + j) % 2) % 2 == 0;

        default:
          throw new Error('bad maskPattern:' + maskPattern);
      }
    },
    getErrorCorrectPolynomial: function getErrorCorrectPolynomial(errorCorrectLength) {
      var a = new QRPolynomial([1], 0);

      for (var i = 0; i < errorCorrectLength; i++) {
        a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
      }

      return a;
    },
    getLengthInBits: function getLengthInBits(mode, type) {
      if (1 <= type && type < 10) {
        switch (mode) {
          case QRMode.MODE_NUMBER:
            return 10;

          case QRMode.MODE_ALPHA_NUM:
            return 9;

          case QRMode.MODE_8BIT_BYTE:
            return 8;

          case QRMode.MODE_KANJI:
            return 8;

          default:
            throw new Error('mode:' + mode);
        }
      } else if (type < 27) {
        switch (mode) {
          case QRMode.MODE_NUMBER:
            return 12;

          case QRMode.MODE_ALPHA_NUM:
            return 11;

          case QRMode.MODE_8BIT_BYTE:
            return 16;

          case QRMode.MODE_KANJI:
            return 10;

          default:
            throw new Error('mode:' + mode);
        }
      } else if (type < 41) {
        switch (mode) {
          case QRMode.MODE_NUMBER:
            return 14;

          case QRMode.MODE_ALPHA_NUM:
            return 13;

          case QRMode.MODE_8BIT_BYTE:
            return 16;

          case QRMode.MODE_KANJI:
            return 12;

          default:
            throw new Error('mode:' + mode);
        }
      } else {
        throw new Error('type:' + type);
      }
    },
    getLostPoint: function getLostPoint(qrCode) {
      var moduleCount = qrCode.getModuleCount();
      var lostPoint = 0;

      for (var row = 0; row < moduleCount; row++) {
        for (var col = 0; col < moduleCount; col++) {
          var sameCount = 0;
          var dark = qrCode.isDark(row, col);

          for (var r = -1; r <= 1; r++) {
            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c++) {
              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrCode.isDark(row + r, col + c)) {
                sameCount++;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += 3 + sameCount - 5;
          }
        }
      }

      for (var row = 0; row < moduleCount - 1; row++) {
        for (var col = 0; col < moduleCount - 1; col++) {
          var count = 0;
          if (qrCode.isDark(row, col)) count++;
          if (qrCode.isDark(row + 1, col)) count++;
          if (qrCode.isDark(row, col + 1)) count++;
          if (qrCode.isDark(row + 1, col + 1)) count++;

          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      for (var row = 0; row < moduleCount; row++) {
        for (var col = 0; col < moduleCount - 6; col++) {
          if (qrCode.isDark(row, col) && !qrCode.isDark(row, col + 1) && qrCode.isDark(row, col + 2) && qrCode.isDark(row, col + 3) && qrCode.isDark(row, col + 4) && !qrCode.isDark(row, col + 5) && qrCode.isDark(row, col + 6)) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col++) {
        for (var row = 0; row < moduleCount - 6; row++) {
          if (qrCode.isDark(row, col) && !qrCode.isDark(row + 1, col) && qrCode.isDark(row + 2, col) && qrCode.isDark(row + 3, col) && qrCode.isDark(row + 4, col) && !qrCode.isDark(row + 5, col) && qrCode.isDark(row + 6, col)) {
            lostPoint += 40;
          }
        }
      }

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col++) {
        for (var row = 0; row < moduleCount; row++) {
          if (qrCode.isDark(row, col)) {
            darkCount++;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;
      return lostPoint;
    }
  };
  var QRMath = {
    glog: function glog(n) {
      if (n < 1) {
        throw new Error('glog(' + n + ')');
      }

      return QRMath.LOG_TABLE[n];
    },
    gexp: function gexp(n) {
      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return QRMath.EXP_TABLE[n];
    },
    EXP_TABLE: new Array(256),
    LOG_TABLE: new Array(256)
  };

  for (var i = 0; i < 8; i++) {
    QRMath.EXP_TABLE[i] = 1 << i;
  }

  for (var i = 8; i < 256; i++) {
    QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
  }

  for (var i = 0; i < 255; i++) {
    QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
  }

  function QRPolynomial(num, shift) {
    if (num.length == undefined$1) {
      throw new Error(num.length + '/' + shift);
    }

    var offset = 0;

    while (offset < num.length && num[offset] == 0) {
      offset++;
    }

    this.num = new Array(num.length - offset + shift);

    for (var i = 0; i < num.length - offset; i++) {
      this.num[i] = num[i + offset];
    }
  }

  QRPolynomial.prototype = {
    get: function get(index) {
      return this.num[index];
    },
    getLength: function getLength() {
      return this.num.length;
    },
    multiply: function multiply(e) {
      var num = new Array(this.getLength() + e.getLength() - 1);

      for (var i = 0; i < this.getLength(); i++) {
        for (var j = 0; j < e.getLength(); j++) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
        }
      }

      return new QRPolynomial(num, 0);
    },
    mod: function mod(e) {
      if (this.getLength() - e.getLength() < 0) {
        return this;
      }

      var ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
      var num = new Array(this.getLength());

      for (var i = 0; i < this.getLength(); i++) {
        num[i] = this.get(i);
      }

      for (var i = 0; i < e.getLength(); i++) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
      }

      return new QRPolynomial(num, 0).mod(e);
    }
  };

  function QRRSBlock(totalCount, dataCount) {
    this.totalCount = totalCount;
    this.dataCount = dataCount;
  }

  QRRSBlock.RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12, 7, 37, 13], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]];

  QRRSBlock.getRSBlocks = function (typeNumber, errorCorrectLevel) {
    var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);

    if (rsBlock == undefined$1) {
      throw new Error('bad rs block @ typeNumber:' + typeNumber + '/errorCorrectLevel:' + errorCorrectLevel);
    }

    var length = rsBlock.length / 3;
    var list = [];

    for (var i = 0; i < length; i++) {
      var count = rsBlock[i * 3 + 0];
      var totalCount = rsBlock[i * 3 + 1];
      var dataCount = rsBlock[i * 3 + 2];

      for (var j = 0; j < count; j++) {
        list.push(new QRRSBlock(totalCount, dataCount));
      }
    }

    return list;
  };

  QRRSBlock.getRsBlockTable = function (typeNumber, errorCorrectLevel) {
    switch (errorCorrectLevel) {
      case QRErrorCorrectLevel.L:
        return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];

      case QRErrorCorrectLevel.M:
        return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];

      case QRErrorCorrectLevel.Q:
        return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];

      case QRErrorCorrectLevel.H:
        return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];

      default:
        return undefined$1;
    }
  };

  function QRBitBuffer() {
    this.buffer = [];
    this.length = 0;
  }

  QRBitBuffer.prototype = {
    get: function get(index) {
      var bufIndex = Math.floor(index / 8);
      return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) == 1;
    },
    put: function put(num, length) {
      for (var i = 0; i < length; i++) {
        this.putBit((num >>> length - i - 1 & 1) == 1);
      }
    },
    getLengthInBits: function getLengthInBits() {
      return this.length;
    },
    putBit: function putBit(bit) {
      var bufIndex = Math.floor(this.length / 8);

      if (this.buffer.length <= bufIndex) {
        this.buffer.push(0);
      }

      if (bit) {
        this.buffer[bufIndex] |= 0x80 >>> this.length % 8;
      }

      this.length++;
    }
  };
  var QRCodeLimitLength = [[17, 14, 11, 7], [32, 26, 20, 14], [53, 42, 32, 24], [78, 62, 46, 34], [106, 84, 60, 44], [134, 106, 74, 58], [154, 122, 86, 64], [192, 152, 108, 84], [230, 180, 130, 98], [271, 213, 151, 119], [321, 251, 177, 137], [367, 287, 203, 155], [425, 331, 241, 177], [458, 362, 258, 194], [520, 412, 292, 220], [586, 450, 322, 250], [644, 504, 364, 280], [718, 560, 394, 310], [792, 624, 442, 338], [858, 666, 482, 382], [929, 711, 509, 403], [1003, 779, 565, 439], [1091, 857, 611, 461], [1171, 911, 661, 511], [1273, 997, 715, 535], [1367, 1059, 751, 593], [1465, 1125, 805, 625], [1528, 1190, 868, 658], [1628, 1264, 908, 698], [1732, 1370, 982, 742], [1840, 1452, 1030, 790], [1952, 1538, 1112, 842], [2068, 1628, 1168, 898], [2188, 1722, 1228, 958], [2303, 1809, 1283, 983], [2431, 1911, 1351, 1051], [2563, 1989, 1423, 1093], [2699, 2099, 1499, 1139], [2809, 2213, 1579, 1219], [2953, 2331, 1663, 1273]];

  function _isSupportCanvas() {
    return typeof CanvasRenderingContext2D != 'undefined';
  } // android 2.x doesn't support Data-URI spec


  function _getAndroid() {
    var android = false;
    var sAgent = navigator.userAgent;

    if (/android/i.test(sAgent)) {
      // android
      android = true;
      var aMat = sAgent.toString().match(/android ([0-9]\.[0-9])/i);

      if (aMat && aMat[1]) {
        android = parseFloat(aMat[1]);
      }
    }

    return android;
  } // Drawing in DOM by using Table tag


  var Drawing = !_isSupportCanvas() ? function () {
    var Drawing = function Drawing(el, htOption) {
      this._el = el;
      this._htOption = htOption;
    };
    /**
     * Draw the QRCode
     *
     * @param {QRCode} oQRCode
     */


    Drawing.prototype.draw = function (oQRCode) {
      var _htOption = this._htOption;
      var _el = this._el;
      var nCount = oQRCode.getModuleCount();
      var nWidth = Math.round(_htOption.width / nCount);
      var nHeight = Math.round((_htOption.height - _htOption.titleHeight) / nCount);

      if (nWidth <= 1) {
        nWidth = 1;
      }

      if (nHeight <= 1) {
        nHeight = 1;
      }

      this._htOption.width = nWidth * nCount;
      this._htOption.height = nHeight * nCount + _htOption.titleHeight;
      this._htOption.quietZone = Math.round(this._htOption.quietZone);
      var aHTML = [];
      var divStyle = '';
      var drawWidth = Math.round(nWidth * _htOption.dotScale);
      var drawHeight = Math.round(nHeight * _htOption.dotScale);

      if (drawWidth < 4) {
        drawWidth = 4;
        drawHeight = 4;
      }

      var nonRequiredColorDark = _htOption.colorDark;
      var nonRequiredcolorLight = _htOption.colorLight;

      if (_htOption.backgroundImage) {
        if (_htOption.autoColor) {
          _htOption.colorDark = "rgba(0, 0, 0, .6);filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr='#99000000', EndColorStr='#99000000');";
          _htOption.colorLight = "rgba(255, 255, 255, .7);filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr='#B2FFFFFF', EndColorStr='#B2FFFFFF');"; // _htOption.colorDark="rgba(0, 0, 0, .6)";
          // _htOption.colorLight='rgba(255, 255, 255, .7)';
        } else {
          _htOption.colorLight = 'rgba(0,0,0,0)';
        }

        var backgroundImageEle = '<div style="display:inline-block; z-index:-10;position:absolute;"><img src="' + _htOption.backgroundImage + '" widht="' + (_htOption.width + _htOption.quietZone * 2) + '" height="' + (_htOption.height + _htOption.quietZone * 2) + '" style="opacity:' + _htOption.backgroundImageAlpha + ';filter:alpha(opacity=' + _htOption.backgroundImageAlpha * 100 + '); "/></div>';
        aHTML.push(backgroundImageEle);
      }

      if (_htOption.quietZone) {
        divStyle = 'display:inline-block; width:' + (_htOption.width + _htOption.quietZone * 2) + 'px; height:' + (_htOption.width + _htOption.quietZone * 2) + 'px;background:' + _htOption.quietZoneColor + '; text-align:center;';
      }

      aHTML.push('<div style="font-size:0;' + divStyle + '">');
      aHTML.push('<table  style="font-size:0;border:0;border-collapse:collapse; margin-top:' + _htOption.quietZone + 'px;" border="0" cellspacing="0" cellspadding="0" align="center" valign="middle">');
      aHTML.push('<tr height="' + _htOption.titleHeight + '" align="center"><td style="border:0;border-collapse:collapse;margin:0;padding:0" colspan="' + nCount + '">');

      if (_htOption.title) {
        var c = _htOption.titleColor;
        var f = _htOption.titleFont;
        aHTML.push('<div style="width:100%;margin-top:' + _htOption.titleTop + 'px;color:' + c + ';font:' + f + ';background:' + _htOption.titleBackgroundColor + '">' + _htOption.title + '</div>');
      }

      if (_htOption.subTitle) {
        aHTML.push('<div style="width:100%;margin-top:' + (_htOption.subTitleTop - _htOption.titleTop) + 'px;color:' + _htOption.subTitleColor + '; font:' + _htOption.subTitleFont + '">' + _htOption.subTitle + '</div>');
      }

      aHTML.push('</td></tr>');

      for (var row = 0; row < nCount; row++) {
        aHTML.push('<tr style="border:0; padding:0; margin:0;" height="7">');

        for (var col = 0; col < nCount; col++) {
          var bIsDark = oQRCode.isDark(row, col);
          var eye = oQRCode.getEye(row, col); // { isDark: true/false, type: PO_TL, PI_TL, PO_TR, PI_TR, PO_BL, PI_BL };

          if (eye) {
            // Is eye
            bIsDark = eye.isDark;
            var type = eye.type; // PX_XX, PX, colorDark, colorLight

            var eyeColorDark = _htOption[type] || _htOption[type.substring(0, 2)] || nonRequiredColorDark;
            aHTML.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:' + nWidth + 'px;height:' + nHeight + 'px;">' + '<span style="width:' + nWidth + 'px;height:' + nHeight + 'px;background-color:' + (bIsDark ? eyeColorDark : nonRequiredcolorLight) + ';display:inline-block"></span></td>');
          } else {
            // Timing Pattern
            var nowDarkColor = _htOption.colorDark;

            if (row == 6) {
              nowDarkColor = _htOption.timing_H || _htOption.timing || nonRequiredColorDark;
              aHTML.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:' + nWidth + 'px;height:' + nHeight + 'px;background-color:' + (bIsDark ? nowDarkColor : nonRequiredcolorLight) + ';"></td>');
            } else if (col == 6) {
              nowDarkColor = _htOption.timing_V || _htOption.timing || nonRequiredColorDark;
              aHTML.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:' + nWidth + 'px;height:' + nHeight + 'px;background-color:' + (bIsDark ? nowDarkColor : nonRequiredcolorLight) + ';"></td>');
            } else {
              aHTML.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:' + nWidth + 'px;height:' + nHeight + 'px;">' + '<div style="display:inline-block;width:' + drawWidth + 'px;height:' + drawHeight + 'px;background-color:' + (bIsDark ? nowDarkColor : _htOption.colorLight) + ';"></div></td>');
            }
          }
        }

        aHTML.push('</tr>');
      }

      aHTML.push('</table>');
      aHTML.push('</div>');

      if (_htOption.logo) {
        // Logo Image
        var img = new Image();

        if (_htOption.crossOrigin != null) {
          img.crossOrigin = _htOption.crossOrigin;
        } // img.crossOrigin="Anonymous";


        img.src = _htOption.logo;
        var imgW = _htOption.width / 3.5;
        var imgH = _htOption.height / 3.5;

        if (imgW != imgH) {
          imgW = imgH;
        }

        if (_htOption.logoWidth) {
          imgW = _htOption.logoWidth;
        }

        if (_htOption.logoHeight) {
          imgH = _htOption.logoHeight;
        }

        var imgDivStyle = 'position:relative; z-index:1;display:table-cell;top:-' + ((_htOption.height - _htOption.titleHeight) / 2 + imgH / 2 + _htOption.quietZone) + 'px;text-align:center; width:' + imgW + 'px; height:' + imgH + 'px;line-height:' + imgW + 'px; vertical-align: middle;';

        if (!_htOption.logoBackgroundTransparent) {
          imgDivStyle += 'background:' + _htOption.logoBackgroundColor;
        }

        aHTML.push('<div style="' + imgDivStyle + '"><img  src="' + _htOption.logo + '"  style="max-width: ' + imgW + 'px; max-height: ' + imgH + 'px;" /> <div style=" display: none; width:1px;margin-left: -1px;"></div></div>');
      }

      if (_htOption.onRenderingStart) {
        _htOption.onRenderingStart(_htOption);
      }

      _el.innerHTML = aHTML.join(''); // Fix the margin values as real size.

      var elTable = _el.childNodes[0];
      var nLeftMarginTable = (_htOption.width - elTable.offsetWidth) / 2;
      var nTopMarginTable = (_htOption.height - elTable.offsetHeight) / 2;

      if (nLeftMarginTable > 0 && nTopMarginTable > 0) {
        elTable.style.margin = nTopMarginTable + 'px ' + nLeftMarginTable + 'px';
      }

      if (this._htOption.onRenderingEnd) {
        this._htOption.onRenderingEnd(this._htOption, null);
      }
    };
    /**
     * Clear the QRCode
     */


    Drawing.prototype.clear = function () {
      this._el.innerHTML = '';
    };

    return Drawing;
  }() : function () {
    // Drawing in Canvas
    function _onMakeImage() {
      if (this._htOption.drawer == 'svg') {
        var svgData = this._oContext.getSerializedSvg(true);

        this.dataURL = svgData;
        this._el.innerHTML = svgData;
      } else {
        // canvas
        // this._elImage.crossOrigin='Anonymous';
        try {
          // if (this._htOption.crossOrigin != null) {
          //     this._elImage.crossOrigin = this._htOption.crossOrigin;
          // }
          var dataURL = this._elCanvas.toDataURL('image/png'); // this._elImage.src = dataURL;


          this.dataURL = dataURL; // this._elImage.style.display = "inline";
          // this._elCanvas.style.display = "none";
        } catch (e) {
          console.error(e);
        }
      }

      if (this._htOption.onRenderingEnd) {
        if (!this.dataURL) {
          console.error("Can not get base64 data, please check: 1. Published the page and image to the server 2. The image request support CORS 3. Configured `crossOrigin:'anonymous'` option");
        }

        this._htOption.onRenderingEnd(this._htOption, this.dataURL);
      }
    } // Android 2.1 bug workaround
    // http://code.google.com/p/android/issues/detail?id=5141


    if (root._android && root._android <= 2.1) {
      var factor = 1 / window.devicePixelRatio;
      var drawImage = CanvasRenderingContext2D.prototype.drawImage;

      CanvasRenderingContext2D.prototype.drawImage = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
        if ('nodeName' in image && /img/i.test(image.nodeName)) {
          for (var i = arguments.length - 1; i >= 1; i--) {
            arguments[i] = arguments[i] * factor;
          }
        } else if (typeof dw == 'undefined') {
          arguments[1] *= factor;
          arguments[2] *= factor;
          arguments[3] *= factor;
          arguments[4] *= factor;
        }

        drawImage.apply(this, arguments);
      };
    }
    /**
     * Check whether the user's browser supports Data URI or not
     *
     * @private
     * @param {Function} fSuccess Occurs if it supports Data URI
     * @param {Function} fFail Occurs if it doesn't support Data URI
     */


    function _safeSetDataURI(fSuccess, fFail) {
      var self = this;
      self._fFail = fFail;
      self._fSuccess = fSuccess; // Check it just once

      if (self._bSupportDataURI === null) {
        var el = document.createElement('img');

        var fOnError = function fOnError() {
          self._bSupportDataURI = false;

          if (self._fFail) {
            self._fFail.call(self);
          }
        };

        var fOnSuccess = function fOnSuccess() {
          self._bSupportDataURI = true;

          if (self._fSuccess) {
            self._fSuccess.call(self);
          }
        };

        el.onabort = fOnError;
        el.onerror = fOnError;
        el.onload = fOnSuccess;
        el.src = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='; // the Image contains 1px data.

        return;
      } else if (self._bSupportDataURI === true && self._fSuccess) {
        self._fSuccess.call(self);
      } else if (self._bSupportDataURI === false && self._fFail) {
        self._fFail.call(self);
      }
    }
    /**
     * Drawing QRCode by using canvas
     *
     * @constructor
     * @param {HTMLElement} el
     * @param {Object} htOption QRCode Options
     */


    var Drawing = function Drawing(el, htOption) {
      this._bIsPainted = false;
      this._android = _getAndroid();
      this._el = el;
      this._htOption = htOption;

      if (this._htOption.drawer == 'svg') {
        this._oContext = {};
        this._elCanvas = {};
      } else {
        // canvas
        this._elCanvas = document.createElement('canvas');

        this._el.appendChild(this._elCanvas);

        this._oContext = this._elCanvas.getContext('2d'); // this._elImage = document.createElement("img");
        // this._elImage.alt = "Scan me!";
        // this._elImage.style.display = "none";
        // this._el.appendChild(this._elImage);
      }

      this._bSupportDataURI = null;
      this.dataURL = null;
    };
    /**
     * Draw the QRCode
     *
     * @param {QRCode} oQRCode
     */


    Drawing.prototype.draw = function (oQRCode) {
      // var _elImage = this._elImage;
      var _htOption = this._htOption;

      if (!_htOption.title && !_htOption.subTitle) {
        _htOption.height -= _htOption.titleHeight;
        _htOption.titleHeight = 0;
      }

      var nCount = oQRCode.getModuleCount();
      var nWidth = Math.round(_htOption.width / nCount);
      var nHeight = Math.round((_htOption.height - _htOption.titleHeight) / nCount);

      if (nWidth <= 1) {
        nWidth = 1;
      }

      if (nHeight <= 1) {
        nHeight = 1;
      }

      _htOption.width = nWidth * nCount;
      _htOption.height = nHeight * nCount + _htOption.titleHeight;
      _htOption.quietZone = Math.round(_htOption.quietZone);
      this._elCanvas.width = _htOption.width + _htOption.quietZone * 2;
      this._elCanvas.height = _htOption.height + _htOption.quietZone * 2;

      if (this._htOption.drawer != 'canvas') {
        // _elImage.style.display = "none";
        // } else {
        this._oContext = new C2S(this._elCanvas.width, this._elCanvas.height);
      }

      this.clear();
      var _oContext = this._oContext;
      _oContext.lineWidth = 0;
      _oContext.fillStyle = _htOption.colorLight;

      _oContext.fillRect(0, 0, this._elCanvas.width, this._elCanvas.height);

      var t = this;

      function drawQuietZoneColor() {
        if (_htOption.quietZone > 0 && _htOption.quietZoneColor) {
          // top
          _oContext.lineWidth = 0;
          _oContext.fillStyle = _htOption.quietZoneColor;

          _oContext.fillRect(0, 0, t._elCanvas.width, _htOption.quietZone); // left


          _oContext.fillRect(0, _htOption.quietZone, _htOption.quietZone, t._elCanvas.height - _htOption.quietZone * 2); // right


          _oContext.fillRect(t._elCanvas.width - _htOption.quietZone, _htOption.quietZone, _htOption.quietZone, t._elCanvas.height - _htOption.quietZone * 2); // bottom


          _oContext.fillRect(0, t._elCanvas.height - _htOption.quietZone, t._elCanvas.width, _htOption.quietZone);
        }
      }

      if (_htOption.backgroundImage) {
        // Background Image
        var bgImg = new Image();

        bgImg.onload = function () {
          _oContext.globalAlpha = 1;
          _oContext.globalAlpha = _htOption.backgroundImageAlpha;
          var imageSmoothingQuality = _oContext.imageSmoothingQuality;
          var imageSmoothingEnabled = _oContext.imageSmoothingEnabled;
          _oContext.imageSmoothingEnabled = true;
          _oContext.imageSmoothingQuality = 'high';

          _oContext.drawImage(bgImg, 0, _htOption.titleHeight, _htOption.width + _htOption.quietZone * 2, _htOption.height + _htOption.quietZone * 2 - _htOption.titleHeight);

          _oContext.imageSmoothingEnabled = imageSmoothingEnabled;
          _oContext.imageSmoothingQuality = imageSmoothingQuality;
          _oContext.globalAlpha = 1;
          drawQrcode.call(t, oQRCode);
        }; // bgImg.crossOrigin='Anonymous';


        if (_htOption.crossOrigin != null) {
          bgImg.crossOrigin = _htOption.crossOrigin;
        }

        bgImg.originalSrc = _htOption.backgroundImage;
        bgImg.src = _htOption.backgroundImage; // DoSomething
      } else {
        drawQrcode.call(t, oQRCode);
      }

      function drawQrcode(oQRCode) {
        if (_htOption.onRenderingStart) {
          _htOption.onRenderingStart(_htOption);
        }

        for (var row = 0; row < nCount; row++) {
          for (var col = 0; col < nCount; col++) {
            var nLeft = col * nWidth + _htOption.quietZone;
            var nTop = row * nHeight + _htOption.quietZone;
            var bIsDark = oQRCode.isDark(row, col);
            var eye = oQRCode.getEye(row, col); // { isDark: true/false, type: PO_TL, PI_TL, PO_TR, PI_TR, PO_BL, PI_BL };

            var nowDotScale = _htOption.dotScale;
            _oContext.lineWidth = 0; // Color handler

            var dColor;
            var lColor;

            if (eye) {
              dColor = _htOption[eye.type] || _htOption[eye.type.substring(0, 2)] || _htOption.colorDark;
              lColor = _htOption.colorLight;
            } else {
              if (_htOption.backgroundImage) {
                lColor = 'rgba(0,0,0,0)';

                if (row == 6) {
                  // dColor = _htOption.timing_H || _htOption.timing || _htOption.colorDark;
                  if (_htOption.autoColor) {
                    dColor = _htOption.timing_H || _htOption.timing || _htOption.autoColorDark;
                    lColor = _htOption.autoColorLight;
                  } else {
                    dColor = _htOption.timing_H || _htOption.timing || _htOption.colorDark;
                  }
                } else if (col == 6) {
                  // dColor = _htOption.timing_V || _htOption.timing || _htOption.colorDark;
                  if (_htOption.autoColor) {
                    dColor = _htOption.timing_V || _htOption.timing || _htOption.autoColorDark;
                    lColor = _htOption.autoColorLight;
                  } else {
                    dColor = _htOption.timing_V || _htOption.timing || _htOption.colorDark;
                  }
                } else {
                  if (_htOption.autoColor) {
                    dColor = _htOption.autoColorDark;
                    lColor = _htOption.autoColorLight;
                  } else {
                    dColor = _htOption.colorDark;
                  }
                }
              } else {
                if (row == 6) {
                  dColor = _htOption.timing_H || _htOption.timing || _htOption.colorDark;
                } else if (col == 6) {
                  dColor = _htOption.timing_V || _htOption.timing || _htOption.colorDark;
                } else {
                  dColor = _htOption.colorDark;
                }

                lColor = _htOption.colorLight;
              }
            }

            _oContext.strokeStyle = bIsDark ? dColor : lColor;
            _oContext.fillStyle = bIsDark ? dColor : lColor;

            if (eye) {
              if (eye.type == 'AO') {
                nowDotScale = _htOption.dotScaleAO;
              } else if (eye.type == 'AI') {
                nowDotScale = _htOption.dotScaleAI;
              } else {
                nowDotScale = 1;
              }

              if (_htOption.backgroundImage && _htOption.autoColor) {
                dColor = (eye.type == 'AO' ? _htOption.AI : _htOption.AO) || _htOption.autoColorDark;
                lColor = _htOption.autoColorLight;
              } else {
                dColor = (eye.type == 'AO' ? _htOption.AI : _htOption.AO) || dColor;
              } // Is eye


              bIsDark = eye.isDark;

              _oContext.fillRect(nLeft + nWidth * (1 - nowDotScale) / 2, _htOption.titleHeight + nTop + nHeight * (1 - nowDotScale) / 2, nWidth * nowDotScale, nHeight * nowDotScale);
            } else {
              if (row == 6) {
                // Timing Pattern
                nowDotScale = _htOption.dotScaleTiming_H;

                _oContext.fillRect(nLeft + nWidth * (1 - nowDotScale) / 2, _htOption.titleHeight + nTop + nHeight * (1 - nowDotScale) / 2, nWidth * nowDotScale, nHeight * nowDotScale);
              } else if (col == 6) {
                // Timing Pattern
                nowDotScale = _htOption.dotScaleTiming_V;

                _oContext.fillRect(nLeft + nWidth * (1 - nowDotScale) / 2, _htOption.titleHeight + nTop + nHeight * (1 - nowDotScale) / 2, nWidth * nowDotScale, nHeight * nowDotScale);
              } else {
                if (_htOption.backgroundImage) {
                  _oContext.fillRect(nLeft + nWidth * (1 - nowDotScale) / 2, _htOption.titleHeight + nTop + nHeight * (1 - nowDotScale) / 2, nWidth * nowDotScale, nHeight * nowDotScale);
                } else {
                  _oContext.fillRect(nLeft + nWidth * (1 - nowDotScale) / 2, _htOption.titleHeight + nTop + nHeight * (1 - nowDotScale) / 2, nWidth * nowDotScale, nHeight * nowDotScale);
                }
              }
            }

            if (_htOption.dotScale != 1 && !eye) {
              _oContext.strokeStyle = _htOption.colorLight;
            }
          }
        }

        if (_htOption.title) {
          _oContext.fillStyle = _htOption.titleBackgroundColor;

          _oContext.fillRect(0, 0, this._elCanvas.width, _htOption.titleHeight + _htOption.quietZone);

          _oContext.font = _htOption.titleFont;
          _oContext.fillStyle = _htOption.titleColor;
          _oContext.textAlign = 'center';

          _oContext.fillText(_htOption.title, this._elCanvas.width / 2, +_htOption.quietZone + _htOption.titleTop);
        }

        if (_htOption.subTitle) {
          _oContext.font = _htOption.subTitleFont;
          _oContext.fillStyle = _htOption.subTitleColor;

          _oContext.fillText(_htOption.subTitle, this._elCanvas.width / 2, +_htOption.quietZone + _htOption.subTitleTop);
        }

        function generateLogoImg(img) {
          var imgContainerW = Math.round(_htOption.width / 3.5);
          var imgContainerH = Math.round(_htOption.height / 3.5);

          if (imgContainerW !== imgContainerH) {
            imgContainerW = imgContainerH;
          }

          if (_htOption.logoMaxWidth) {
            imgContainerW = Math.round(_htOption.logoMaxWidth);
          } else if (_htOption.logoWidth) {
            imgContainerW = Math.round(_htOption.logoWidth);
          }

          if (_htOption.logoMaxHeight) {
            imgContainerH = Math.round(_htOption.logoMaxHeight);
          } else if (_htOption.logoHeight) {
            imgContainerH = Math.round(_htOption.logoHeight);
          }

          var nw;
          var nh;

          if (typeof img.naturalWidth == 'undefined') {
            // IE 6/7/8
            nw = img.width;
            nh = img.height;
          } else {
            // HTML5 browsers
            nw = img.naturalWidth;
            nh = img.naturalHeight;
          }

          if (_htOption.logoMaxWidth || _htOption.logoMaxHeight) {
            if (_htOption.logoMaxWidth && nw <= imgContainerW) {
              imgContainerW = nw;
            }

            if (_htOption.logoMaxHeight && nh <= imgContainerH) {
              imgContainerH = nh;
            }

            if (nw <= imgContainerW && nh <= imgContainerH) {
              imgContainerW = nw;
              imgContainerH = nh;
            }
          }

          var imgContainerX = (_htOption.width + _htOption.quietZone * 2 - imgContainerW) / 2;
          var imgContainerY = (_htOption.height + _htOption.titleHeight + _htOption.quietZone * 2 - imgContainerH) / 2;
          var imgScale = Math.min(imgContainerW / nw, imgContainerH / nh);
          var imgW = nw * imgScale;
          var imgH = nh * imgScale;

          if (_htOption.logoMaxWidth || _htOption.logoMaxHeight) {
            imgContainerW = imgW;
            imgContainerH = imgH;
            imgContainerX = (_htOption.width + _htOption.quietZone * 2 - imgContainerW) / 2;
            imgContainerY = (_htOption.height + _htOption.titleHeight + _htOption.quietZone * 2 - imgContainerH) / 2;
          } // Did Not Use Transparent Logo Image


          if (!_htOption.logoBackgroundTransparent) {
            //if (!_htOption.logoBackgroundColor) {
            //_htOption.logoBackgroundColor = '#ffffff';
            //}
            _oContext.fillStyle = _htOption.logoBackgroundColor;

            _oContext.fillRect(imgContainerX, imgContainerY, imgContainerW, imgContainerH);
          }

          var imageSmoothingQuality = _oContext.imageSmoothingQuality;
          var imageSmoothingEnabled = _oContext.imageSmoothingEnabled;
          _oContext.imageSmoothingEnabled = true;
          _oContext.imageSmoothingQuality = 'high';

          _oContext.drawImage(img, imgContainerX + (imgContainerW - imgW) / 2, imgContainerY + (imgContainerH - imgH) / 2, imgW, imgH);

          _oContext.imageSmoothingEnabled = imageSmoothingEnabled;
          _oContext.imageSmoothingQuality = imageSmoothingQuality;
          drawQuietZoneColor();
          _this._bIsPainted = true;

          _this.makeImage();
        }

        if (_htOption.logo) {
          // Logo Image
          var img = new Image();

          var _this = this;

          img.onload = function () {
            generateLogoImg(img);
          };

          img.onerror = function (e) {
            console.error(e);
          }; // img.crossOrigin="Anonymous";


          if (_htOption.crossOrigin != null) {
            img.crossOrigin = _htOption.crossOrigin;
          }

          img.originalSrc = _htOption.logo;
          img.src = _htOption.logo;
        } else {
          drawQuietZoneColor();
          this._bIsPainted = true;
          this.makeImage();
        }
      }
    };
    /**
     * Make the image from Canvas if the browser supports Data URI.
     */


    Drawing.prototype.makeImage = function () {
      if (this._bIsPainted) {
        _safeSetDataURI.call(this, _onMakeImage);
      }
    };
    /**
     * Return whether the QRCode is painted or not
     *
     * @return {Boolean}
     */


    Drawing.prototype.isPainted = function () {
      return this._bIsPainted;
    };
    /**
     * Clear the QRCode
     */


    Drawing.prototype.clear = function () {
      this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height);

      this._bIsPainted = false;
    };

    Drawing.prototype.remove = function () {
      this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height);

      this._bIsPainted = false;
      this._el.innerHTML = '';
    };
    /**
     * @private
     * @param {Number} nNumber
     */


    Drawing.prototype.round = function (nNumber) {
      if (!nNumber) {
        return nNumber;
      }

      return Math.floor(nNumber * 1000) / 1000;
    };

    return Drawing;
  }();
  /**
   * Get the type by string length
   *
   * @private
   * @param {String} sText
   * @param {Number} nCorrectLevel
   * @return {Number} type
   */

  function _getTypeNumber(sText, _htOption) {
    var nCorrectLevel = _htOption.correctLevel;
    var nType = 1;

    var length = _getUTF8Length(sText);

    for (var i = 0, len = QRCodeLimitLength.length; i < len; i++) {
      var nLimit = 0;

      switch (nCorrectLevel) {
        case QRErrorCorrectLevel.L:
          nLimit = QRCodeLimitLength[i][0];
          break;

        case QRErrorCorrectLevel.M:
          nLimit = QRCodeLimitLength[i][1];
          break;

        case QRErrorCorrectLevel.Q:
          nLimit = QRCodeLimitLength[i][2];
          break;

        case QRErrorCorrectLevel.H:
          nLimit = QRCodeLimitLength[i][3];
          break;
      }

      if (length <= nLimit) {
        break;
      } else {
        nType++;
      }
    }

    if (nType > QRCodeLimitLength.length) {
      throw new Error('Too long data. the CorrectLevel.' + ['M', 'L', 'H', 'Q'][nCorrectLevel] + ' limit length is ' + nLimit);
    }

    if (_htOption.version != 0) {
      if (nType <= _htOption.version) {
        nType = _htOption.version;
        _htOption.runVersion = nType;
      } else {
        console.warn('QR Code version ' + _htOption.version + ' too small, run version use ' + nType);
        _htOption.runVersion = nType;
      }
    }

    return nType;
  }

  function _getUTF8Length(sText) {
    var replacedText = encodeURI(sText).toString().replace(/\%[0-9a-fA-F]{2}/g, 'a');
    return replacedText.length + (replacedText.length != sText.length ? 3 : 0);
  }

  QRCode = function QRCode(el, vOption) {
    this._htOption = {
      width: 256,
      height: 256,
      typeNumber: 4,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRErrorCorrectLevel.H,
      dotScale: 1,
      // For body block, must be greater than 0, less than or equal to 1. default is 1
      dotScaleTiming: 1,
      // Dafault for timing block , must be greater than 0, less than or equal to 1. default is 1
      dotScaleTiming_H: undefined$1,
      // For horizontal timing block, must be greater than 0, less than or equal to 1. default is 1
      dotScaleTiming_V: undefined$1,
      // For vertical timing block, must be greater than 0, less than or equal to 1. default is 1
      dotScaleA: 1,
      // Dafault for alignment block, must be greater than 0, less than or equal to 1. default is 1
      dotScaleAO: undefined$1,
      // For alignment outer block, must be greater than 0, less than or equal to 1. default is 1
      dotScaleAI: undefined$1,
      // For alignment inner block, must be greater than 0, less than or equal to 1. default is 1
      quietZone: 0,
      quietZoneColor: 'rgba(0,0,0,0)',
      title: '',
      titleFont: 'normal normal bold 16px Arial',
      titleColor: '#000000',
      titleBackgroundColor: '#ffffff',
      titleHeight: 0,
      // Title Height, Include subTitle
      titleTop: 30,
      // draws y coordinates. default is 30
      subTitle: '',
      subTitleFont: 'normal normal normal 14px Arial',
      subTitleColor: '#4F4F4F',
      subTitleTop: 60,
      // draws y coordinates. default is 0
      logo: undefined$1,
      logoWidth: undefined$1,
      logoHeight: undefined$1,
      logoMaxWidth: undefined$1,
      logoMaxHeight: undefined$1,
      logoBackgroundColor: '#ffffff',
      logoBackgroundTransparent: false,
      // === Posotion Pattern(Eye) Color
      PO: undefined$1,
      // Global Posotion Outer color. if not set, the defaut is `colorDark`
      PI: undefined$1,
      // Global Posotion Inner color. if not set, the defaut is `colorDark`
      PO_TL: undefined$1,
      // Posotion Outer - Top Left
      PI_TL: undefined$1,
      // Posotion Inner - Top Left
      PO_TR: undefined$1,
      // Posotion Outer - Top Right
      PI_TR: undefined$1,
      // Posotion Inner - Top Right
      PO_BL: undefined$1,
      // Posotion Outer - Bottom Left
      PI_BL: undefined$1,
      // Posotion Inner - Bottom Left
      // === Alignment Color
      AO: undefined$1,
      // Alignment Outer. if not set, the defaut is `colorDark`
      AI: undefined$1,
      // Alignment Inner. if not set, the defaut is `colorDark`
      // === Timing Pattern Color
      timing: undefined$1,
      // Global Timing color. if not set, the defaut is `colorDark`
      timing_H: undefined$1,
      // Horizontal timing color
      timing_V: undefined$1,
      // Vertical timing color
      // ==== Backgroud Image
      backgroundImage: undefined$1,
      // Background Image
      backgroundImageAlpha: 1,
      // Background image transparency, value between 0 and 1. default is 1.
      autoColor: false,
      // Automatic color adjustment(for data block)
      autoColorDark: 'rgba(0, 0, 0, .6)',
      // Automatic color: dark CSS color
      autoColorLight: 'rgba(255, 255, 255, .7)',
      // Automatic color: light CSS color
      // ==== Event Handler
      onRenderingStart: undefined$1,
      onRenderingEnd: undefined$1,
      // ==== Versions
      version: 0,
      // The symbol versions of QR Code range from Version 1 to Version 40. default 0 means automatically choose the closest version based on the text length.
      // ==== Tooltip
      tooltip: false,
      // Whether set the QRCode Text as the title attribute value of the image
      // ==== Binary(hex) data mode
      binary: false,
      // Whether it is binary mode, default is text mode.
      // ==== Drawing method
      drawer: 'canvas',
      // Drawing method: canvas, svg(Chrome, FF, IE9+)
      // ==== CORS
      crossOrigin: null,
      // String which specifies the CORS setting to use when retrieving the image. null means that the crossOrigin attribute is not set.
      // UTF-8 without BOM
      utf8WithoutBOM: true
    };

    if (typeof vOption === 'string') {
      vOption = {
        text: vOption
      };
    } // Overwrites options


    if (vOption) {
      for (var i in vOption) {
        this._htOption[i] = vOption[i];
      }
    }

    if (this._htOption.version < 0 || this._htOption.version > 40) {
      console.warn("QR Code version '" + this._htOption.version + "' is invalidate, reset to 0");
      this._htOption.version = 0;
    }

    if (this._htOption.dotScale < 0 || this._htOption.dotScale > 1) {
      console.warn(this._htOption.dotScale + ' , is invalidate, dotScale must greater than 0, less than or equal to 1, now reset to 1. ');
      this._htOption.dotScale = 1;
    }

    if (this._htOption.dotScaleTiming < 0 || this._htOption.dotScaleTiming > 1) {
      console.warn(this._htOption.dotScaleTiming + ' , is invalidate, dotScaleTiming must greater than 0, less than or equal to 1, now reset to 1. ');
      this._htOption.dotScaleTiming = 1;
    }

    if (this._htOption.dotScaleTiming_H) {
      if (this._htOption.dotScaleTiming_H < 0 || this._htOption.dotScaleTiming_H > 1) {
        console.warn(this._htOption.dotScaleTiming_H + ' , is invalidate, dotScaleTiming_H must greater than 0, less than or equal to 1, now reset to 1. ');
        this._htOption.dotScaleTiming_H = 1;
      }
    } else {
      this._htOption.dotScaleTiming_H = this._htOption.dotScaleTiming;
    }

    if (this._htOption.dotScaleTiming_V) {
      if (this._htOption.dotScaleTiming_V < 0 || this._htOption.dotScaleTiming_V > 1) {
        console.warn(this._htOption.dotScaleTiming_V + ' , is invalidate, dotScaleTiming_V must greater than 0, less than or equal to 1, now reset to 1. ');
        this._htOption.dotScaleTiming_V = 1;
      }
    } else {
      this._htOption.dotScaleTiming_V = this._htOption.dotScaleTiming;
    }

    if (this._htOption.dotScaleA < 0 || this._htOption.dotScaleA > 1) {
      console.warn(this._htOption.dotScaleA + ' , is invalidate, dotScaleA must greater than 0, less than or equal to 1, now reset to 1. ');
      this._htOption.dotScaleA = 1;
    }

    if (this._htOption.dotScaleAO) {
      if (this._htOption.dotScaleAO < 0 || this._htOption.dotScaleAO > 1) {
        console.warn(this._htOption.dotScaleAO + ' , is invalidate, dotScaleAO must greater than 0, less than or equal to 1, now reset to 1. ');
        this._htOption.dotScaleAO = 1;
      }
    } else {
      this._htOption.dotScaleAO = this._htOption.dotScaleA;
    }

    if (this._htOption.dotScaleAI) {
      if (this._htOption.dotScaleAI < 0 || this._htOption.dotScaleAI > 1) {
        console.warn(this._htOption.dotScaleAI + ' , is invalidate, dotScaleAI must greater than 0, less than or equal to 1, now reset to 1. ');
        this._htOption.dotScaleAI = 1;
      }
    } else {
      this._htOption.dotScaleAI = this._htOption.dotScaleA;
    }

    if (this._htOption.backgroundImageAlpha < 0 || this._htOption.backgroundImageAlpha > 1) {
      console.warn(this._htOption.backgroundImageAlpha + ' , is invalidate, backgroundImageAlpha must between 0 and 1, now reset to 1. ');
      this._htOption.backgroundImageAlpha = 1;
    }

    this._htOption.height = this._htOption.height + this._htOption.titleHeight;

    if (typeof el == 'string') {
      el = document.getElementById(el);
    }

    if (!this._htOption.drawer || this._htOption.drawer != 'svg' && this._htOption.drawer != 'canvas') {
      this._htOption.drawer = 'canvas';
    }

    this._android = _getAndroid();
    this._el = el;
    this._oQRCode = null;
    var _htOptionClone = {};

    for (var i in this._htOption) {
      _htOptionClone[i] = this._htOption[i];
    }

    this._oDrawing = new Drawing(this._el, _htOptionClone);

    if (this._htOption.text) {
      this.makeCode(this._htOption.text);
    }
  };
  /**
   * Make the QRCode
   *
   * @param {String} sText link data
   */


  QRCode.prototype.makeCode = function (sText) {
    this._oQRCode = new QRCodeModel(_getTypeNumber(sText, this._htOption), this._htOption.correctLevel);

    this._oQRCode.addData(sText, this._htOption.binary, this._htOption.utf8WithoutBOM);

    this._oQRCode.make();

    if (this._htOption.tooltip) {
      this._el.title = sText;
    }

    this._oDrawing.draw(this._oQRCode); //		this.makeImage();

  };
  /**
   * Make the Image from Canvas element
   * - It occurs automatically
   * - Android below 3 doesn't support Data-URI spec.
   *
   * @private
   */


  QRCode.prototype.makeImage = function () {
    if (typeof this._oDrawing.makeImage == 'function' && (!this._android || this._android >= 3)) {
      this._oDrawing.makeImage();
    }
  };
  /**
   * Clear the QRCode
   */


  QRCode.prototype.clear = function () {
    this._oDrawing.remove();
  };
  /**
   * Resize the QRCode
   */


  QRCode.prototype.resize = function (width, height) {
    this._oDrawing._htOption.width = width;
    this._oDrawing._htOption.height = height;

    this._oDrawing.draw(this._oQRCode);
  };
  /**
   * No Conflict
   * @return QRCode object
   */


  QRCode.prototype.noConflict = function () {
    if (root.QRCode === this) {
      root.QRCode = _QRCode;
    }

    return QRCode;
  };
  /**
   * @name QRCode.CorrectLevel
   */


  QRCode.CorrectLevel = QRErrorCorrectLevel;
  /*--------------------------------------------------------------------------*/
  // Export QRCode
  // AMD & CMD Compatibility

  if (typeof define == 'function' && (define.amd || define.cmd)) {
    // 1. Define an anonymous module
    define([], function () {
      return QRCode;
    });
  } // CommonJS Compatibility(include NodeJS)
  else if (freeModule) {
    // Node.js
    (freeModule.exports = QRCode).QRCode = QRCode; // Other CommonJS

    freeExports.QRCode = QRCode;
  } else {
    // Export Global
    root.QRCode = QRCode;
  }
}

var version = "2.4.0";

var formatVersion = version.replace(/\./g, '_'); //replace . with _

QRCode();

function getUserAgentData() {
  return new Promise(function (resolve) {
    if (isUACHSupported()) {
      navigator.userAgentData.getHighEntropyValues(['model', 'platformVersion']).then(function (clientHints) {
        resolve({
          model: clientHints.model,
          platformVersion: clientHints.platformVersion
        });
      })["catch"](function () {
        resolve();
      });
    } else {
      resolve();
    }
  });
}

(function () {
  var generateOneLinkURL = function generateOneLinkURL() {
    var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      afParameters: {}
    };
    var oneLinkURL = parameters.oneLinkURL,
        _parameters$afParamet = parameters.afParameters;
    _parameters$afParamet = _parameters$afParamet === void 0 ? {} : _parameters$afParamet;
    var mediaSource = _parameters$afParamet.mediaSource,
        _parameters$referrerS = parameters.referrerSkipList,
        referrerSkipList = _parameters$referrerS === void 0 ? [] : _parameters$referrerS,
        _parameters$urlSkipLi = parameters.urlSkipList,
        urlSkipList = _parameters$urlSkipLi === void 0 ? [] : _parameters$urlSkipLi;
    if (!isOneLinkURLValid(oneLinkURL)) return null;
    if (!isSkipListsValid({
      referrerSkipList: referrerSkipList,
      urlSkipList: urlSkipList
    })) return null;
    if (!validatedMs(mediaSource)) return null;
    var currentURLParams = getURLParametersKV(window.location.search);
    var validParams = validateAndMappedParams(parameters.afParameters, currentURLParams);
    if (!validParams) return null;

    var afParams = _objectSpread2({
      af_js_web: true,
      af_ss_ver: window.AF_SMART_SCRIPT.version
    }, validParams);

    var finalParams = stringifyParameters(afParams).replace('&', '?');
    var finalURL = oneLinkURL + finalParams;
    console.debug('Generated OneLink URL', finalURL);

    window.AF_SMART_SCRIPT.displayQrCode = function (htmlId) {
      if (!finalURL) {
        console.debug('ClickURL is not valid');
        return null;
      }

      return new QRCode(document.getElementById(htmlId), {
        text: "".concat(finalURL, "&af_ss_qr=true")
      });
    };

    var createImpressionsLink = function createImpressionsLink() {
      if (!finalURL) {
        console.debug('ClickURL is not valid');
        return null;
      }

      return new Promise(function (resolve) {
        getUserAgentData().then(function (userAgentData) {
          var url = new URL(finalURL);
          url.hostname = 'impressions.onelink.me';

          if (userAgentData) {
            url.pathname = "/ch".concat(url.pathname);
            url.searchParams.append('af_ch_model', encodeURIComponent(userAgentData.model));
            url.searchParams.append('af_ch_os_version', encodeURIComponent(userAgentData.platformVersion));
          }

          resolve(url.href);
        })["catch"](function () {
          resolve();
        });
      });
    };

    createImpressionsLink().then(function (impressionsLinkURL) {
      if (impressionsLinkURL) {
        window.AF_SMART_SCRIPT.fireImpressionsLink = function () {
          var img = new Image(1, 1);
          img.style.display = 'none';
          img.style.position = 'absolute';
          img.style.left = '-1px';
          img.style.top = '-1px';
          img.src = impressionsLinkURL;
        };
      }
    });
    return {
      clickURL: finalURL
    };
  };

  var generateDirectClickURL = function generateDirectClickURL() {
    var _campaign$keys;

    var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      afParameters: {},
      referrerSkipList: [],
      urlSkipList: []
    };
    var _parameters$afParamet2 = parameters.afParameters,
        afParameters = _parameters$afParamet2 === void 0 ? {} : _parameters$afParamet2,
        _parameters$referrerS2 = parameters.referrerSkipList,
        referrerSkipList = _parameters$referrerS2 === void 0 ? [] : _parameters$referrerS2,
        _parameters$urlSkipLi2 = parameters.urlSkipList,
        urlSkipList = _parameters$urlSkipLi2 === void 0 ? [] : _parameters$urlSkipLi2,
        platform = parameters.platform,
        app_id = parameters.app_id,
        redirectURL = parameters.redirectURL;
    var mediaSource = afParameters.mediaSource,
        campaign = afParameters.campaign;

    if (!mediaSource) {
      console.error("mediaSource is missing , can't generate URL", mediaSource);
      return null;
    }

    if (!campaign) {
      console.error("campaign  is missing , can't generate URL", campaign);
      return null;
    }

    if (!app_id) {
      console.error("app_id is missing , can't generate URL", app_id);
      return null;
    }

    if (!redirectURL) {
      console.error("redirectURL is missing , can't generate URL", redirectURL);
      return null;
    }

    if (!isPlatformValid(platform)) return null;

    if (typeof app_id !== 'string') {
      console.error('app_id must be a string');
      return null;
    }

    if ((campaign === null || campaign === void 0 ? void 0 : (_campaign$keys = campaign.keys) === null || _campaign$keys === void 0 ? void 0 : _campaign$keys.length) === 0 && !(campaign !== null && campaign !== void 0 && campaign.defaultValue)) {
      console.error("campaign is missing (default value was not supplied), can't generate URL", mediaSource);
      return null;
    }

    if (!isSkipListsValid({
      referrerSkipList: referrerSkipList,
      urlSkipList: urlSkipList
    })) return null;
    if (!validatedMs(mediaSource)) return null;
    var currentURLParams = getURLParametersKV(window.location.search);
    var validParams = validateAndMappedParams(parameters.afParameters, currentURLParams, true);
    if (!validParams) return null;

    var afParams = _objectSpread2({
      af_js_web: true,
      af_ss_ver: window.AF_SMART_SCRIPT.version
    }, validParams);

    var finalParams = stringifyParameters(afParams).replace('&', '?');
    var clickBaseUrl = 'https://engagements.appsflyer.com/v1.0/c2s/click/app';
    var finalURL = "".concat(clickBaseUrl, "/").concat(platform, "/").concat(app_id).concat(finalParams, "&af_r=").concat(encodeURIComponent(redirectURL));
    console.debug('generate Direct Click URL', finalURL);
    delete window.AF_SMART_SCRIPT.displayQrCode;
    delete window.AF_SMART_SCRIPT.fireImpressionsLink;
    return {
      clickURL: finalURL
    };
  };

  window.AF_SMART_SCRIPT = {
    generateOneLinkURL: generateOneLinkURL,
    generateDirectClickURL: generateDirectClickURL,
    version: formatVersion
  };
})();
