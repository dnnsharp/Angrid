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
        "pagination": "simple",
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

    var firstNames = ['John', 'Mike', 'Rich', 'Bill', 'Diana', 'Mark', 'Andrey', 'Benjamin', 'Claude', 'Kevin', 'Eric', 'Ginger', 'Olivia', 'Josh', 'David', 'Joyce', 'Celine'];
    var lastNames = ['Burke', 'Lee', 'Smith', 'Doe', 'Glen', 'Jackson', 'Morgan', 'Fleetwood', 'Clapton', 'Rice', 'Slaugher', 'Spacey', 'Backon', 'Wright', 'Siam', 'Emerson'];

    $scope.data = [];
    for (var i = 0; i < 63; i++){
        $scope.data.push({ 
            "Id": i, 
            "FirstName": firstNames[Math.floor((Math.random() * firstNames.length))],
            "LastName": lastNames[Math.floor((Math.random() * lastNames.length))],
            'Url': 'http://example.com'
        });
    }
}

// for minification purposes
AppCtrl.$inject = ['$scope', '$http', '$timeout'];

