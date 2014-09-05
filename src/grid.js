;

// fix IE console issues
if (!window.console) window.console = {};
if (!window.console.log) window.console.log = function () { };

var angrid = angular.module('angrid', []);

function ArrayDataSource(arr, $) {

    $ = $ || jQuery;

    // for referencing inside functions
    var _dataSource = this;

    // this is the entire array
    this.raw = arr;
    this._currentSortingByField = null;

    // this will hold current page of data
    this.data = [];
    this.filters = {};

    // total number of results in the data source
    this.totalResults = arr.length;

    // the current page of data
    this.currentQuery = null;

    // returns a list of values for a given filter (TODO and current query)
    this.getFilterValues = function (filterName) { //, query) {

        var result = [];
        $.each(this.raw, function (i, v) {
            if ($.inArray(v[filterName], result) == -1) result.push(v[filterName]);
        });
        return result;
    };

    // returns a list of values for a given filter and current query
    this.getFilterValues = function (filterName, query, fnDone) {

        var data = [];
        $.each(this.raw, function (i, v) {
            if ($.inArray(v[filterName], data) == -1) data.push(v[filterName]);
        });
        _dataSource.filters[filterName] = data;

        // call async
        fnDone && setTimeout(fnDone, 1);
    };


    this.load = function (query, fnDone, fnError) {

        if (isNaN(query.currentPage))
            query.currentPage = 1;

        if (isNaN(query.currentPageSize) || query.currentPageSize == 0)
            query.currentPageSize = query.defaultPageSize();

        if (query.pageCount() > 0) {
            if (query.currentPage < 1)
                query.currentPage = 1;
            else if (query.currentPage > query.pageCount())
                query.currentPage = query.pageCount()
        }

        //if (query.pageCount() > 0 && (query.currentPage < 1 || query.currentPage > query.pageCount()))
        //    return;

        this.currentQuery = query;
        var results = this.raw.slice(0);

        // apply filters first
        if (query.filters) {
            $.each(query.filters, function (filterName, filterValue) {
                results = $.grep(results, function (item) {
                    return item[filterName] == filterValue;
                });
            });
        }

        // apply search
        if (query.search) {
            var re = new RegExp(query.search, "i");
            results = $.grep(results, function (item) {
                // search all fields
                var found = false;
                for (var field in item) {
                    if (item.hasOwnProperty(field) && typeof item[field] == "string") {
                        found = re.test(item[field]);
                        if (found)
                            break;
                    }
                }
                return found;
            });
        }

        // if sorting is applied, sort the raw array first
        if (query.sort.field && query.sort.field != this._currentSortingByField) {
            results.sort(function (a, b) {
                if (a[query.sort.field] >= b[query.sort.field])
                    return query.sort.ascending ? 1 : -1;
                return query.sort.ascending ? -1 : 1;
            });
        }

        this.totalResults = results.length;
        this.data = results.slice((query.currentPage - 1) * query.currentPageSize, query.currentPage * query.currentPageSize);

        // call async
        fnDone && setTimeout(fnDone, 1);
    };

}

function _find(collection, callback){
    var elementFound=undefined;
    $.each(collection, function(i, element){
        if (callback(element)){
            elementFound=element;
            return false;
        };
    });
    return elementFound;
};

function WebServiceDataSource(opts, $) {

    $ = $ || jQuery;

    // for referencing inside functions
    var _dataSource = this;

    // the current page of data
    this.currentQuery = null;

    var defaultOpts = {
        transformResults: function (data) { return data.Results },
        totalResults: function (data) { return data.TotalResults }
    };

    this.options = $.extend({}, defaultOpts, opts);

    this.data = [];
    this.filters = {};

    function resolveUrl(url, query, otherParams) {

        // let's build a flat data structure for passing to the server
        var data = query.toJson();

        if (otherParams)
            $.extend(data, otherParams);

        // if is a function, call it
        if ($.isFunction(url))
            return url(data);

        return url + (url.indexOf('?') == -1 ? '?' : '&') + $.param(data);
    }

    this.serveRequest = null;

    this.load = function (query, fnDone, fnError) {

        this.serveRequest && this.serveRequest.abort();
        this.serveRequest = null;

        if (isNaN(query.currentPage))
            query.currentPage = 1;

        if (isNaN(query.currentPageSize) || query.currentPageSize == 0)
            query.currentPageSize = query.defaultPageSize();

        if (query.pageCount() > 0) {
            if (query.currentPage < 1)
                query.currentPage = 1;
            else if (query.currentPage > query.pageCount())
                query.currentPage = query.pageCount()
        }

        var url = resolveUrl(this.options.dataUrl, query);

        this.serveRequest = $.getJSON(url).done(function (data) {

            if (data.error || data.Error) {
                fnError && fnError(data.error || data.Error);
                return;
            }

            _dataSource.data = _dataSource.options.transformResults(data);
            _dataSource.totalResults = _dataSource.options.totalResults(data);

            fnDone && fnDone();
        }).fail(function (data) {

            if (data.statusText != 'abort')
                fnError && fnError(data);
        });
    };

    // returns a list of values for a given filter and current query
    this.getFilterValues = function (filterName, query, fnDone) {

        var url = resolveUrl(this.options.filterValuesUrl, query, { filterName: filterName });
        $.getJSON(url).done(function (data) {

            _dataSource.filters[filterName] = data;
            fnDone && fnDone();
        });
    };

}


// directives

angrid.directive('buttonbar', [function () {

    return {
        replace: false,
        templateUrl: '/buttonbar.html',
        scope: true,
        link: function (scope, element, attrs) {
            scope.position = attrs.position;

            scope.onGridButton = function (btn, confirm) {

                if (btn.askForConfirmation && !confirm) {
                    scope.confirmAction = btn;
                    return;
                }

                scope.$parent.onGridButton(btn);
            };
        }
    };
}]);

angrid.directive('nobubble', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            element.bind('click', function (e) {
                e.stopPropagation();
            });
        }
    };
});


angrid.directive('angridView', ['$compile', function ($compile) {
    return {
        restrict: 'A',
        scope: true,
        replace: true,
        template: '',
        link: function (scope, element, attrs) {

            // pass all marked attributes to nested directive
            scope.$watch('settings.viewDirective', function(){
                var tpl = $('<div>');
                tpl.attr(scope.settings.viewDirective, scope.settings.viewUrl + '?v=' + scope.settings.v);
                //tpl.attr('tpl', scope.settings.viewUrl + '?v=' + scope.settings.v);
                var tplHtml = $('<div>').append(tpl).html();
                $compile(tplHtml)(scope, function (cloned, scope) {
                    element.html(cloned);
                });
            });

            //for (var i in element[0].attributes) {
            //    var name = element[0].attributes[i].name;
            //    if (name && name.indexOf('pass-') != -1)
            //        tplEl.attr(name.replace('pass-', ''), element[0].attributes[i].value);
            //}

            //var tpl = $('<div>').append(tplEl).html();
            //$compile(tpl)(scope, function (cloned, scope) {
            //    element.append(cloned);
            //});
        }
    }
}]);


angrid.directive('angrid', ['$compile', '$timeout', '$parse', '$sce', '$templateCache', '$interpolate', '$http', function ($compile, $timeout, $parse, $sce, $templateCache, $interpolate, $http) {
    return {
        scope: {
            settings: '=',
            source: '='
        },
        templateUrl: function (element, attr) {
            return attr.templateUrl || 'src/grid.html?v=' + attr.version;
        },
        link: function (scope, element, attrs) {
    
            // see if we have a special version of jQuery
            var $ = window[scope.settings.$] || window.$;
            scope.defaultSingleSettings={
                "searchEnabled": true,
                "useArraySyntax": false,
                "pagination": "touch",
                "viewDirective": "angrid-grid-view",
                "viewUrl": "angrid/src/views/grid/view.html"
            };
            scope.defaultObjectSettings={
                "initalQuery": {
                    "currentPageSize": 4,
                    "currentPage": 1
                }
            };
            scope.defaultArraySettings={
                "columns": {
                    "sortable": true,
                    "visible": true,
                    "displayLabel": true,
                    "showOn": {
                        "mobile": true,
                        "tablet": true,
                        "desktop": true,
                        "large": true,
                    }
                },
                "itemButtons": {
                    "cssClass": "default",
                    "confirmationMessage": "Are you sure you want to execute this action?",
                    "confirmationOk": "Yes, pretty sure",
                    "confirmationCancel": "No, I'm having second thoughts",
                },
                "gridButtons": {
                    "cssClass": "default",
                    "verticalPosition": "bottom",
                    "horizontalPosition": "left",
                    "confirmationMessage": "Are you sure you want to execute this action?",
                    "confirmationOk": "Yes, pretty sure",
                    "confirmationCancel": "No, I'm having second thoughts",
                },
            };
            scope.$watch('settings', function(){
                $.each(scope.defaultSingleSettings, function(setting, value){
                    if(!scope.settings.hasOwnProperty(setting)){
                        scope.settings[setting]=value;
                    };
                });
                $.each(scope.defaultObjectSettings, function(setting, value){
                    if(!scope.settings.hasOwnProperty(setting)){
                        scope.settings[setting]=value;
                    }
                    else{
                        $.each(scope.defaultObjectSettings[setting], function(setting2, value2){
                            if(!scope.settings[setting].hasOwnProperty(setting2)){
                                scope.settings[setting][setting2]=value2;
                            };
                        });
                    };
                });
                $.each(scope.defaultArraySettings, function(setting, value){
                    if(scope.settings.hasOwnProperty(setting)){
                        $.each(scope.settings[setting], function(index, value2){
                            $.each(value, function(setting3, value3){
                                if(!value2.hasOwnProperty(setting3)){
                                    value2[setting3]=value3;
                                };
                            });
                        });
                    };
                });
            });

            scope.$sce = $sce;

            // sanitize data
            if (!scope.settings.pageSizes)
                scope.settings.pageSizes = [4, 12, 24, 48];

            // initialize settings
            scope.settings = $.extend({
                dropdownClass: 'dropdown'
            }, scope.settings);

            scope.source.gridSettings = scope.settings;

            // initialize query with the defaults from settings
            scope.query = $.extend({}, {
                currentPage: 1,
                currentPageSize: scope.settings.pageSizes[0],
                search: '',
                sort: { 'field': '', 'ascending': true },
                filters: {},

                pageCount: function () {
                    return Math.floor(scope.source.totalResults / scope.query.currentPageSize)
                        + (scope.source.totalResults % scope.query.currentPageSize == 0 ? 0 : 1);
                },
                defaultPageSize: function () {
                    return scope.settings.pageSizes ? scope.settings.pageSizes[0] : 10
                },

                toJson: function () {
                    var data = {
                        page: this.currentPage,
                        pagesize: this.currentPageSize,
                        search: this.search,
                        sort: this.sort.field,
                        sortAsc: this.sort.ascending
                    };

                    // append filters
                    $.each(this.filters, function (name, value) {
                        data[(scope.source.options.filterPrefix || '') + name] = value;
                    });
                    return data;
                }

            }, scope.settings.initalQuery);

            scope.interpolate = function (content) {
                return $interpolate(content)(scope);
            };

            scope.localize = function (localization, fallback, bHtml, bInterpolate) {
                localization = localization || fallback;
                if (bInterpolate) localization = $interpolate(localization)(scope);
                if (bHtml) localization = $sce.trustAsHtml(localization);
                return localization;
            };

            // also watch inital data for changes
            scope.$watch('settings.initalQuery', function () {
                $.extend(scope.query, scope.settings.initalQuery);
                // reload data
                scope.source.load(scope.query, fnDataLoaded, fnError);
            }, true);


            // this function gets called after data is loaded by the data source
            var fnDataLoaded = function () {
                scope.pages = [];
                for (var i = 1; i <= scope.query.pageCount() ; i++)
                    scope.pages.push(i);

                scope.loading = false;

               $.each(scope.source.data, function (i, row) {
                   var rowFound=_find(scope.selected, function(selectedRow){
                       return selectedRow.id === row.id;
                   });
                   if (rowFound)
                       row.$_selected=true;
               });
                // call row handlers, if any
                if (scope.settings.onRowLoaded)
                    $.each(scope.source.data, function (i, row) {
                        scope.settings.onRowLoaded(row);
                    });

                if (!scope.$$phase)
                    scope.$apply();

                scope.$broadcast('angrid.dataReceived');
            };

            var fnError = function (error) {
                scope.error = error.responseText || error;
                scope.loading = false;
                if (!scope.$$phase)
                    scope.$apply();
            };

            // refresh data when query changes
            scope.$watch('query', function () {
                scope.loadPage(scope.query.currentPage);
            }, true);

            // loads a new page, keeping existing query
            scope.loadPage = function (page) {

                if (scope.query.pageCount() > 0 && (page < 1 || page > scope.query.pageCount()))
                    return;

                scope.message = "";

                scope.loading = true;
                scope.query.currentPage = page;
                scope.source.load(scope.query, fnDataLoaded, fnError);
            };

            // sort by a field, inversing the order on second call on same field
            scope.sortBy = function (fieldName) {
                if (scope.query.sort.field == fieldName) {
                    scope.query.sort.ascending = !scope.query.sort.ascending;
                } else {
                    scope.query.sort.field = fieldName;
                }
            };

            // this is invoked on key up, so add a delay so we don't do it on every later
            scope.delayedSearch = function (terms) {
                scope._searchTimer && $timeout.cancel(scope._searchTimer);
                scope._searchTimer = $timeout(function () {
                    scope.query.currentPage = 1;
                    scope.query.search = terms;
                }, 100);
            };


            scope.toggleFilters = function () {
                scope.$_editFilters = !scope.$_editFilters;

                if (scope.$_editFilters) {
                    // refresh all filters from server
                    scope.loading = true;
                    $.each($.grep(scope.settings.columns, function (c) { return c.filterable; }), function (i, c) {
                        scope.source.getFilterValues(c.name, scope.query, fnDataLoaded, fnError);
                    });
                }
            };

            scope.hasFilters = function () {
                return $.grep(scope.settings.columns, function (col) {
                    return col.filterable;
                }).length > 0;
            };

            scope.filter = function (col, val) {
                scope.query.filters[col.name] = val;
                scope.loadPage(1);
            };

            scope.clearFilters = function () {
                scope.query.filters = {};
                scope.loadPage(1);
            };


            // when some item is selected, we save it in an array, so we keep the selection upon navigation
            scope.selected = [];
            scope.toggleSelect = function (item) {
                item.$_selected = !item.$_selected;
                if (item.$_selected) {
                    scope.selected.push(item);
                } else {
                    scope.selected = $.grep(scope.selected, function (sel) { return sel.id != item.id });
                }
            };

            scope.clearSelection = function () {
                for (var i = 0; i < scope.selected.length; i++)
                    scope.selected[i].$_selected = false;
                scope.selected = [];
            };

            // buttons

            //scope.topButtons = function () {
            //    return $.grep(scope.settings.gridButtons, function (btn) {
            //        return btn.verticalPosition == 'top';
            //    })
            //};

            //scope.bottomButtons = function () {
            //    return $.grep(scope.settings.gridButtons, function (btn) {
            //        return btn.verticalPosition == 'bottom';
            //    })
            //};

            // setup button handlers
            scope.settings.btnHandlers = scope.settings.btnHandlers || [];

            function getPropCi(obj, propName) {
                for (var p in obj) {
                    if (obj.hasOwnProperty(p) && propName.toLowerCase() == p.toLowerCase())
                        return obj[p];
                }
            }

            window.angridEditDone = function (iframe) {
                var popup = $(iframe).closest('.modal');
                popup.modal('hide');
                popup.find('.modal-body').empty();
                scope.loadPage(scope.query.currentPage);
            };

            var __prevHeight = 0;
            setInterval(function () {
                var iframe = element.find('.angrid-popup iframe');
                if (!iframe.length)
                    return;

                try {
                    var bodyHeight = $(iframe[0].contentDocument.body).height();
                    if (bodyHeight != __prevHeight) {
                        __prevHeight = bodyHeight;
                        iframe.height(Math.max(200, bodyHeight));
                    }
                } catch (e) {
                    iframe.height('80%');
                    iframe.parent().height('80%');
                }
            }, 200);

            // handle redirects
            scope.settings.btnHandlers.push(function (data, fnDone, fnError) {
                var url = getPropCi(data, 'url');
                if (url) {
                    // also handle popups
                    var isPopup = getPropCi(data, 'popup');
                    if (!isPopup) {
                        window.location = url;
                        return false;
                    }

                    // open popup
                    var popup = element.find('.angrid-popup');
                    scope.popupTitle = getPropCi(data, 'popupTitle');
                    popup.modal({ backdrop: true });

                    popup.on('hide.bs.modal', function () {
                        fnDone && fnDone();
                        scope.$apply();
                        scope.loadPage(scope.query.currentPage);
                    });

                    // append iframe
                    popup.find('.modal-body').empty().append('<iframe width="100%" src="' + url + '" frameborder="0" scrolling="yes"></iframe>');

                    return true;
                }
            });

            // handle messages
            scope.settings.btnHandlers.push(function (data, fnDone, fnError) {
                var message = getPropCi(data, 'message') || getPropCi(data, 'error');
                if (message) {
                    fnDone && fnDone();
                    fnError && fnError(message);
                    return true;
                }
            });


            function executeButton(btn, data, fnDone, fnError) {

                // append query
                //data = $.extend({}, data, scope.query.toJson());
                var queryData = scope.query.toJson();
                for (var i in queryData) {
                    if (queryData.hasOwnProperty(i))
                        if ($.isArray(data)) {
                            data.push({ name: i, value: queryData[i] });
                        } else {
                            data[i] = queryData[i];
                        }
                }

                $http({
                    method: 'POST',
                    url: btn.url,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    data: $.param(data)
                }).success(function (data, status) {

                    //if (data.error) {
                    //    scope.actionError = data.error;
                    //    return;
                    //}

                    // get a response
                    if (data.angrid == 'refresh') {
                        scope.selected = [];
                        scope.loadPage(1);
                    }

                    // find a handler
                    var result = data;
                    for (var h = 0; h < scope.settings.btnHandlers.length; h++) {
                        result = scope.settings.btnHandlers[h](data, fnDone, fnError);

                        // a handler that returns false it means that all execution should stop
                        // for example, because of a redirect
                        //if (result === false)
                        //    return;

                        // a handler that returns true, means the response was handled and angrid should stop spinning
                        if (result == true)
                            break;
                    }

                    //var message = scope.settings.onRespone && scope.settings.onRespone(data);
                    //if (message)
                    //    scope.actionError = message;

                    // sto spinning or somethin
                    scope.$broadcast('angrid.dataReceived');
                    scope.executing = false;
                    scope.loading = false;
                });
            };

            scope.onItemButton = function (row, btn, confirm) {

                if (btn.askForConfirmation && !confirm) {
                    row.$_confirmAction = btn;
                    return;
                }

                row.$_executing = true;
                executeButton(btn, $.extend({ 'id': row.id }, row.data), function (result) {
                    row.$_executing = false;
                }, function (err) {
                    row.$_err = err;
                });
            };

            scope.onGridButton = function (btn) {

                scope.executing = true;
                scope.loading = true;
                
                var data = [];
                if (scope.settings.useArraySyntax){
                    $.each(scope.selected, function (i, row) {
                        data.push({ name: 'id[]', value: row.id });
                        if (typeof row.data !== 'undefined'){
                            $.each(row.data, function (name, val) {
                                data.push({ name: (name + '[]'), value: val });
                            });
                        };
                    });
                }
                else{
                    $.each(scope.selected, function (i, row) {
                        data.push({ name: 'id', value: row.id });
                        if (typeof row.data !== 'undefined'){
                            $.each(row.data, function (name, val) {
                                data.push({ name: name, value: val });
                            });
                        };
                    });
                };
                //var ids = $.map(scope.selected, function (i) { return { name: 'id', value: i.id, data: i.data }; })

                // faltten data
                //var data = [];
                //$.each(ids, function () {
                //});

                executeButton(btn, data, function (result) {
                    scope.executing = false;
                    scope.loading = false;
                }, function (err) {
                    scope.actionError = err;
                });
            };

            // if source is array, build an ArrayDataSource around it
            if ($.isArray(scope.source)) {
                scope.source = new ArrayDataSource(scope.source);
                scope.loadPage(scope.query.currentPage);
            }

        }
    };
}]);

