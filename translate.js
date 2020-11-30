// ==UserScript==
// @name         translate
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       huanent
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  "use strict";

  /** @type {HTMLDivElement} */
  let _popup;
  /**@type {HTMLDivElement} */
  let _icon;
  /**@type {HTMLDivElement} */
  let _win;
  /**@type {string} */
  let _selectedText;

  window.addEventListener("mouseup", async (e) => {
    _selectedText = window.getSelection().toString().trim();
    if (_selectedText) showPopup(e.pageX, e.pageY);
  });

  window.addEventListener("mousedown", () => {
    _selectedText = "";

    if (_popup) {
      _icon.style.display = "inline-block";
      _win.style.display = "none";
      _popup.style.display = "none";
    }
  });

  async function translate(text) {
    let appid = "20200817000545264";
    let secret = "dpCCwxOhV3uqFR76aLp7";
    let salt = new Date().getTime().toString();
    let sign = MD5(appid + text + salt + secret);

    return await runAsync(
      `https://fanyi-api.baidu.com/api/trans/vip/translate?q=${encodeURI(
        text
      )}&appid=${appid}&salt=${salt}&from=auto&to=zh&sign=${sign}`,
      "get"
    );
  }

  function runAsync(url, send_type, data_ry) {
    var p = new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: send_type,
        url: url,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        data: data_ry,
        onload: function (response) {
          resolve(response.responseText);
        },
        onerror: function (response) {
          console.log(response);
          reject("请求失败");
        },
      });
    });

    return p;
  }

  var MD5 = function (string) {
    function RotateLeft(lValue, iShiftBits) {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function AddUnsigned(lX, lY) {
      var lX4, lY4, lX8, lY8, lResult;
      lX8 = lX & 0x80000000;
      lY8 = lY & 0x80000000;
      lX4 = lX & 0x40000000;
      lY4 = lY & 0x40000000;
      lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
      if (lX4 & lY4) {
        return lResult ^ 0x80000000 ^ lX8 ^ lY8;
      }
      if (lX4 | lY4) {
        if (lResult & 0x40000000) {
          return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
        } else {
          return lResult ^ 0x40000000 ^ lX8 ^ lY8;
        }
      } else {
        return lResult ^ lX8 ^ lY8;
      }
    }

    function F(x, y, z) {
      return (x & y) | (~x & z);
    }
    function G(x, y, z) {
      return (x & z) | (y & ~z);
    }
    function H(x, y, z) {
      return x ^ y ^ z;
    }
    function I(x, y, z) {
      return y ^ (x | ~z);
    }

    function FF(a, b, c, d, x, s, ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    }

    function GG(a, b, c, d, x, s, ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    }

    function HH(a, b, c, d, x, s, ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    }

    function II(a, b, c, d, x, s, ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    }

    function ConvertToWordArray(string) {
      var lWordCount;
      var lMessageLength = string.length;
      var lNumberOfWords_temp1 = lMessageLength + 8;
      var lNumberOfWords_temp2 =
        (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
      var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
      var lWordArray = Array(lNumberOfWords - 1);
      var lBytePosition = 0;
      var lByteCount = 0;
      while (lByteCount < lMessageLength) {
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] =
          lWordArray[lWordCount] |
          (string.charCodeAt(lByteCount) << lBytePosition);
        lByteCount++;
      }
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
      lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
      lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
      return lWordArray;
    }

    function WordToHex(lValue) {
      var WordToHexValue = "",
        WordToHexValue_temp = "",
        lByte,
        lCount;
      for (lCount = 0; lCount <= 3; lCount++) {
        lByte = (lValue >>> (lCount * 8)) & 255;
        WordToHexValue_temp = "0" + lByte.toString(16);
        WordToHexValue =
          WordToHexValue +
          WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
      }
      return WordToHexValue;
    }

    function Utf8Encode(string) {
      string = string.replace(/\r\n/g, "\n");
      var utftext = "";

      for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);

        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if (c > 127 && c < 2048) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }

      return utftext;
    }

    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7,
      S12 = 12,
      S13 = 17,
      S14 = 22;
    var S21 = 5,
      S22 = 9,
      S23 = 14,
      S24 = 20;
    var S31 = 4,
      S32 = 11,
      S33 = 16,
      S34 = 23;
    var S41 = 6,
      S42 = 10,
      S43 = 15,
      S44 = 21;

    string = Utf8Encode(string);

    x = ConvertToWordArray(string);

    a = 0x67452301;
    b = 0xefcdab89;
    c = 0x98badcfe;
    d = 0x10325476;

    for (k = 0; k < x.length; k += 16) {
      AA = a;
      BB = b;
      CC = c;
      DD = d;
      a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
      d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
      c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
      b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
      a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
      d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
      c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
      b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
      a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
      d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
      c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
      b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
      a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
      d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
      c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
      b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
      a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
      d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
      c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
      b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
      a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
      d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
      c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
      b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
      a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
      d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
      c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
      b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
      a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
      d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
      c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
      b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
      a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
      d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
      c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
      b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
      a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
      d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
      c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
      b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
      a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
      d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
      c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
      b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
      a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
      d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
      c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
      b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
      a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
      d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
      c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
      b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
      a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
      d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
      c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
      b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
      a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
      d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
      c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
      b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
      a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
      d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
      c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
      b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
      a = AddUnsigned(a, AA);
      b = AddUnsigned(b, BB);
      c = AddUnsigned(c, CC);
      d = AddUnsigned(d, DD);
    }

    var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

    return temp.toLowerCase();
  };

  function showPopup(x, y) {
    if (!_popup) {
      _popup = document.createElement("div");
      _popup.style.position = "absolute";
      _popup.style.display = "inline-block";
      _popup.style.zIndex = "10000000";

      _popup.onmouseup = (e) => e.stopPropagation();
      _popup.onmousedown = (e) => e.stopPropagation();
      let root = _popup.attachShadow({ mode: "closed" });
      _icon = createIcon();
      _win = createwindow();
      root.appendChild(_icon);
      root.appendChild(_win);
      document.documentElement.appendChild(_popup);
    }

    _popup.onclick = async (e) => {
      _icon.style.display = "none";
      _win.style.display = "inline-block";
      let result = JSON.parse(await translate(_selectedText));
      _win.innerText = result.trans_result.map((m) => m.dst).join(" ");
    };

    _popup.style.left = (x + 40 > screen.width ? x - 40 : x) + "px";
    _popup.style.top = (y < 40 ? y + 10 : y - 40) + "px";
    _popup.style.display = "inline-block";
  }

  function createIcon() {
    const el = document.createElement("div");
    el.innerHTML =
      '<svg t="1606579402320" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="816" ><path d="M388.1 642.4h53.8c3.9 0 6.7-3.8 5.5-7.6l-26.8-82.6c-1.7-5.3-9.3-5.4-11 0l-27 82.6c-1.3 3.8 1.5 7.6 5.5 7.6z" fill="#64B5F6" p-id="817"></path><path d="M553.3 413.3H276.2c-29 0-52.8 23.8-52.8 52.8V774c0 29 23.8 52.8 52.8 52.8h277.1c29 0 52.8-23.8 52.8-52.8V466.1c0-29.1-23.7-52.8-52.8-52.8zM520 759c-2.9 3.5-6.9 5.9-11.7 6.9-1.7 0.4-3.4 0.5-5 0.5-2.9 0-5.6-0.5-8.2-1.6-6.6-2.8-8.9-7.5-9.7-11.2l-23.3-72.2c-1.2-3.7-4.7-6.3-8.6-6.3h-79.3c-2.9 0-5.4 1.8-6.3 4.5l-24.2 73.9c-2.1 4.5-5.5 8-10.2 10.3-4.8 2.3-9.5 3-14.1 1.9-6.8-1.3-10.3-5.3-11.9-8.3-1.8-3.1-3.3-8.6 0.5-16.4l79.4-242.8c5.1-12.9 14.6-19.5 27.7-19.5h0.2c12.6 0.3 22.2 6.8 27.7 18.8l0.3 0.7L522.4 744c1.9 5.6 1 10.9-2.4 15z" fill="#64B5F6" p-id="818"></path><path d="M761.7 224.1h-254c-35.4 0-64.3 28.9-64.3 64.3V367c0 6.4 5.2 11.5 11.5 11.5h68.8c9.7 0 19.1 1.2 28.2 3.6-2.8-9.3-5.3-18.8-7.5-28.6h-34.6c-7.5-0.8-11.6-6.8-12.3-17.9 0.7-11 4.8-17 12.3-17.9H617c-3.7-11-6-20.4-6.7-28.1-1.5-9.3 1.9-15.7 10.1-19.1 9.7-2.6 16.8 0 21.2 7.7 1.5 5.1 3.7 12.8 6.7 23 2.2 7.7 3.7 13.2 4.5 16.6h89.4c9.7 0.9 14.9 6.8 15.6 17.9 0 11.1-4.9 17-14.5 17.9H721c-3 0-4.5 0.4-4.5 1.3-10.4 52.8-29.4 96.5-57 131.4 22.3 17.9 50.6 33.6 84.9 47.2 9.7 3.4 13 11 10.1 23-3.7 9.3-11.2 12.3-22.3 8.9-35.2-12.3-66.9-28.6-95.1-48.8v109.6c0 6.4 5.2 11.5 11.5 11.5h113.3c35.4 0 64.3-28.9 64.3-64.3v-285c-0.1-35.4-29.1-64.3-64.5-64.3z" fill="#1E88E5" p-id="819"></path><path d="M674.9 353.5h-88.7c-3.7 0-6.4 3.5-5.5 7 4.1 15.3 9.4 30.1 15.9 44.3 0.3 0.7 0.8 1.3 1.4 1.9 14.3 12.5 25.5 28.6 32.1 46.8 6.5 0.8 3.7 0.5 10.2 1.3 19.5-29.9 32.8-61.4 40-94.4 0.8-3.6-1.9-6.9-5.4-6.9z" fill="#1E88E5" p-id="820"></path></svg>';
    el.style.width = "30px";
    el.style.height = "30px";
    el.style.backgroundColor = "#FFF";
    el.style.padding = "2px";
    el.style.borderRadius = "50%";
    el.style.boxShadow = "0px 0px 10px #ddd";
    el.style.opacity = 0.7;
    return el;
  }

  function createwindow() {
    const el = document.createElement("div");
    el.style.width = "300px";
    el.style.height = "300px";
    el.style.backgroundColor = "red";
    el.style.display = "none";
    return el;
  }
})();
