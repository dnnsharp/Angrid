;

var app = angular.module('TestGridApp', ['angrid']);

// main app controller
function AppCtrl($scope, $http, $timeout) {

    $scope.settings = {
        "pageSizes": [5, 10, 20, 40],
        "search": true,
        "initalQuery": {
            "currentPageSize": 5,
            "currentPage": 2
        },
        "pagination": "touch",
        "columns": [
            {
                "name": "Id",
                "title": "#",
                "sortable": true,
                "visible": true,
                "filterable": false
            },
            {
                "name": "FirstName",
                "title": "First Name",
                "sortable": true,
                "visible": true,
                "filterable": true
            },
            {
                "name": "LastName",
                "title": "Last Name",
                "sortable": false,
                "visible": true,
                "filterable": true
            }
        ],

        "specialFields": {
            "id": "Id",
            "url": "Url"
        }
            
    };

    // setup array data source
    var firstNames = ['John', 'Mike', 'Rich', 'Bill', 'Diana', 'Mark', 'Andrey', 'Benjamin', 'Claude', 'Kevin', 'Eric', 'Ginger', 'Olivia', 'Josh', 'David', 'Joyce', 'Celine'];
    var lastNames = ['Burke', 'Lee', 'Smith', 'Doe', 'Glen', 'Jackson', 'Morgan', 'Fleetwood', 'Clapton', 'Rice', 'Slaugher', 'Spacey', 'Backon', 'Wright', 'Siam', 'Emerson'];

    $scope.arrDataSource = [];
    for (var i = 0; i < 63; i++){
        $scope.arrDataSource.push({
            "Id": i, 
            "FirstName": firstNames[Math.floor((Math.random() * firstNames.length))],
            "LastName": lastNames[Math.floor((Math.random() * lastNames.length))],
            'Url': 'http://example.com'
        });
    }
    
    // setup web service data source
    //$scope.webServiceDataSource = new WebServiceDataSource('http://localhost:30720/DesktopModules/DnnSharp/ActionGrid/Api.ashx?TabID=2173&alias=localhost%3a30720&mid=3788', {
    //    transformResults: function (data) {
    //        var arr = [];
    //        for (var i = 0; i < data.Results.length; i++) {
    //            var row = {};
    //            for (var j = 0; j < data.Results[i].Fields.length; j++) {
    //                var f = data.Results[i].Fields[j];
    //                row[f.Name] = f.Value;
    //            }
    //            arr.push(row);
    //        }
    //        return arr;
    //    },
    //    totalResults: function (data) {
    //        return data.TotalResults
    //    }
    //});

    $scope.currentDataSource = $scope.arrDataSource;
}

// for minification purposes
AppCtrl.$inject = ['$scope', '$http', '$timeout'];

