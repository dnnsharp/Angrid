;

var app = angular.module('TestGridApp', ['angrid']);

// main app controller
function AppCtrl($scope, $http, $timeout) {

    $scope.settings = {
        "pageSizes": [5, 10, 20, 40],
        "search": true,
        "initalQuery": {
            "currentPageSize": 10,
            "currentPage": 2
        },
        "columns": [
            {
                "name": "Id",
                "title": "#",
                "sortable": true,
                "visible": true
            },
            {
                "name": "FirstName",
                "title": "First Name",
                "sortable": true,
                "visible": true
            },
            {
                "name": "LastName",
                "title": "Last Name",
                "sortable": false,
                "visible": true
            }
        ]
    };

    $scope.data = [];
    for (var i = 0; i < 63; i++){
        $scope.data.push({ "Id": i, "FirstName": "John " + i, "LastName": "Wayne " + i });
    }
}

// for minification purposes
AppCtrl.$inject = ['$scope', '$http', '$timeout'];

