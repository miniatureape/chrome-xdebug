
var cookies = {};
var allowed_types = ["main_frame", "sub_frame", "xmlhttprequest"];
var xDebugParam = '';
var filtersArr = [];

function rememberCookieUrls(sld, url) {
    cookies[sld] = url;
    chrome.storage.local.set({cookies: cookies}, function() {
         console.log('stored', arguments);
    });
}

function unRememberCookie(sld) {
    delete cookies[sld];
    chrome.storage.local.set({cookies: cookies}, function() {
         console.log('stored', arguments);
    });
}

var UrlUtil = {

    el: document.createElement('a'),

    getHost: function(url) {
	this.el.href = url;
	return this.el.hostname;
    },
    
    getSLD: function(url) {
	var host = this.getHost(url);
	var parts = host.split('.');
	return [parts.pop(), parts.pop()].reverse().join('.');
    },
}

function shouldStrip(info) {

    var url = info.url;

    var reqSLD = UrlUtil.getSLD(info.url);

    if (! reqSLD in cookies) {
        return false;
    }

    if (allowed_types.indexOf(info.type) === -1) {
        return false;
    }

    for (var i = 0; i < filtersArr.length; i++) {

	var regex = RegExp(filtersArr[i]);

        if (regex.test(url)) {
             return true;
	}

    }

    return false;
}

function maybeStripCookie(info) {

    if (!shouldStrip(info)) {
         return;
    }

    var cookieValue = "XDEBUG_SESSION=" + xDebugParam + "; ";
    var headers = info.requestHeaders;

    for (var i = 0; i < headers.length; i++) {

        if (headers[i].name === 'Cookie') {


            headers[i].value = headers[i].value.replace(cookieValue, '');
            return {requestHeaders: headers}

        }
    }

}

function updateOptions(data) {
    if (data.filtersArr) filtersArr = data.filtersArr.newValue;
    if (data.xDebugParam) xDebugParam = data.xDebugParam.newValue;
}

function getOptions(data) {
    if (data.filters) filtersArr = data.filters;
    if (data.xDebugParam) xDebugParam = data.xDebugParam;
    if (data.cookies) cookies = data.cookies;
}

chrome.webRequest.onBeforeSendHeaders.addListener(
	maybeStripCookie, 
	{urls: ["<all_urls>"]}, 
	["blocking", "requestHeaders"]
); 

chrome.storage.onChanged.addListener(updateOptions);
chrome.storage.local.get(null, getOptions)
