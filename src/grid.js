;

var angrid = angular.module('angrid', ['ngAnimate']);

function ArrayDataSource(arr) {

    // for referencing inside functions
    var _dataSource = this;

    // this is the entire array
    this.raw = arr;
    this._currentSortingByField = null;

    // this will hold current page of data
    this.data = [];

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

    this.load = function (query, fnDone) {

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
            $.each(query.filters, function(filterName, filterValue){
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
        fnDone && fnDone();
    };

    this.delete = function (items, fnDone) {
        $.each(items, function (i, o) {
            _dataSource.raw.splice(jQuery.inArray(o, _dataSource.raw), 1);
        });

        fnDone && fnDone();
    }
}


angrid.directive('angrid', ['$compile', '$timeout', '$parse', '$sce', function ($compile, $timeout, $parse, $sce) {
    return {
        scope: {
            settings: '=',
            source: '='
        },
        templateUrl: 'src/grid.html',
        link: function (scope, element, attrs) {

            // sanitize data
            if (!scope.settings.pageSizes)
                scope.settings.pageSizes = [10];

            // initialize query with the defaults from settings
            scope.query = $.extend({}, {
                currentPage: 1,
                currentPageSize: scope.settings.pageSizes[0],
                search: '',
                sort: { 'field': '', 'ascending': true },
                filters: { },

                pageCount: function () {
                    return Math.floor(scope.source.totalResults / scope.query.currentPageSize)
                        + (scope.source.totalResults % scope.query.currentPageSize == 0 ? 0 : 1);
                },
                defaultPageSize: function () {
                    return scope.settings.pageSizes ? scope.settings.pageSizes[0] : 10
                }

            }, scope.settings.initalQuery);

            // also watch inital data for changes
            scope.$watch('settings.initalQuery', function () {
                $.extend(scope.query, scope.settings.initalQuery);
                // reload data
                scope.source.load(scope.query, fnDataLoaded);
            }, true);


            // this function gets called after data is loaded by the data source
            var fnDataLoaded = function () {
                scope.pages = [];
                for (var i = 1; i <= scope.query.pageCount() ; i++)
                    scope.pages.push(i);
            };

            // refresh data when query changes
            scope.$watch('query', function () {
                scope.source.load(scope.query, fnDataLoaded);
            }, true);

            // loads a new page, keeping existing query
            scope.loadPage = function (page) {

                if (scope.query.pageCount() > 0 && (page < 1 || page > scope.query.pageCount()))
                    return;

                scope.query.currentPage = page;
                scope.source.load(scope.query, fnDataLoaded);
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
                    scope.selected = $.grep(scope.selected, function (sel) { return sel[scope.settings.specialFields.id] != item[scope.settings.specialFields.id] });
                }
                //console.log(scope.selected);
            };

            scope.clearSelection = function () {
                for (var i = 0; i < scope.selected.length; i++)
                    scope.selected[i].$_selected = false;
                scope.selected = [];
            };

            scope.deleteSelected = function () {
                scope.source.delete(scope.selected, function () {
                    scope.selected = [];
                    scope.loadPage(1);
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

