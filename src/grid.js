;

var angrid = angular.module('angrid', ['ngAnimate']);

function ArrayDataSource(arr) {

    // this is the entire array
    this.raw = arr;
    this._currentSortingByField = null;

    // this will hold current page of data
    this.data = [];

    // total number of results in the data source
    this.totalResults = arr.length;
    
    // the current page of data
    this.currentQuery = null;

    this.load = function (query, fnDone) {

        if (query.pageCount() > 0 && (query.currentPage < 1 || query.currentPage > query.pageCount()))
            return;

        this.currentQuery = query;
        var results = this.raw.slice(0);

        // if search is applied, filter results first
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

                pageCount: function () {
                    return Math.floor(scope.source.totalResults / scope.query.currentPageSize)
                        + (scope.source.totalResults % scope.query.currentPageSize == 0 ? 0 : 1);
                }
            }, scope.settings.initalQuery);

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

            // if source is array, build an ArrayDataSource around it
            if ($.isArray(scope.source)) {
                scope.source = new ArrayDataSource(scope.source);
                scope.loadPage(scope.query.currentPage);
            }

        }
    };
}])
