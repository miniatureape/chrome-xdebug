(function() {

	var bg = chrome.extension.getBackgroundPage();
       
	var toggleBtnOn = document.getElementById('toggle-btn-on');
	var toggleBtnOff = document.getElementById('toggle-btn-off');

	toggleBtnOn.addEventListener('click', turnOnXDebug);
	toggleBtnOff.addEventListener('click', turnOffXDebug);

	var currentUrl = '';
	var currentDomain = '';
        var currentSLD = '';
	var cookieName = 'XDEBUG_SESSION';
        var cookieValue = bg.xDebugParam;

	chrome.tabs.query({active: true, currentWindow: true}, function(results) {

	    var activeTab = results[0];

            currentUrl = activeTab.url;
	    currentDomain = bg.UrlUtil.getHost(activeTab.url);
	    currentSLD = bg.UrlUtil.getSLD(activeTab.url);

	    chrome.cookies.getAll({domain: currentSLD, name: cookieName}, function(cookies) {
		 showToggle(cookies.length > 0);
	    });

	});

	function showToggle(on) {
	    if (on) {
		hide(toggleBtnOn);
		show(toggleBtnOff);
	    } else {
		hide(toggleBtnOff);
		show(toggleBtnOn);
	    }
	}

	function show(elem) {
	     elem.style.display = 'block';
	}

	function hide(elem) {
	     elem.style.display = 'none';
	}

	function turnOnXDebug() { 
	    setXDebug('on') 
	};

	function turnOffXDebug() { 
	    setXDebug('off') 
	}

	function setXDebug(state) {
	    state === 'on' ? setCookie() : unsetCookie();
	}

	function setCookie() {

	    bg.rememberCookieUrls(currentSLD, currentUrl);

	    chrome.cookies.set({
		name: cookieName, 
		url: currentUrl,
                domain: currentSLD,
                value: cookieValue,
	        path: '/',
            }, function(cookie) {
                showToggle(true);
            })

            window.close();

	}

	function unsetCookie() {

            var urlForSLD = bg.cookies[currentSLD];

	    chrome.cookies.remove({
		name: cookieName, 
		url: urlForSLD,
            }, function() {
                showToggle(false);
            });

	    bg.unRememberCookie(currentSLD);
            window.close();
	}

})()
