(function() {

    var filtersArr = [];

    var filtersListElem = document.getElementById('filters');

    function handleFilterClick(e) {
	var yes = confirm("Delete?");

       if (!yes) {
          return;
       }

       filtersArr.splice(filtersArr.indexOf(e.currentTarget.textContent), 1);
       e.currentTarget.remove();
       chrome.storage.local.set({"filters": filtersArr});
    }

    function addFilter(filter) {
       filtersArr.push(filter);
       chrome.storage.local.set({"filters": filtersArr});
       showFilter(filter);
    }

    function showFilter(filter) {
        if (!filter) return;
	var li = document.createElement('li');
	var textNode = document.createTextNode(filter.toString());
	li.appendChild(textNode);
	filtersListElem.appendChild(li);
    }

    function populateFilters(data) {

	filtersArr = filtersArr.concat(data.filters);

	for (var i = 0; i < filtersArr.length; i++) {
	    showFilter(filtersArr[i]);
	}

	addFilterEvents();
    }

    function populateXDebugParam(data) {
	var paramInput = document.getElementById('xdebug-param');
	paramInput.value = data.xDebugParam;
    }

    function getFilters() {
       chrome.storage.local.get('filters', populateFilters)
    }

    function getXDebugParam() {
       chrome.storage.local.get('xDebugParam', populateXDebugParam)
    }

    document.getElementById('add-filter-form').addEventListener('submit', function(e) {

	e.preventDefault();

	var filterInput = document.getElementById('add-filter');

	if (filterInput.value) {
	    addFilter(filterInput.value);
	}

    });

    document.getElementById('xdebug-param-form').addEventListener('submit', function(e) {

	e.preventDefault();

	var paramInput = document.getElementById('xdebug-param');

	if (paramInput.value) {
	    chrome.storage.local.set({"xDebugParam": paramInput.value});
	}

    });

    function addFilterEvents() {

	var nodes = document.querySelectorAll('#filters li')

	for (var i = 0; i < nodes.length; i++) {
	     nodes[i].addEventListener('click', handleFilterClick);
	}

    }

    getFilters();
    getXDebugParam();

})()
