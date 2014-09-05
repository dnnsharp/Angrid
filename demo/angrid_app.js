angular.module('angridApp', ['angrid']).

value('webAPIURL', 'api.php').

value('webRoot', '../').

controller('AngridCtrl', ['$scope', '$http', 'webAPIURL', 'webRoot', function($scope, $http, webAPIURL, webRoot){
    $scope.defaultSettings={
        "filtersEnabled": true,
        "useArraySyntax": true,
        "columns": [
            {
                "name": "id",
                "title": "#"
            },
            {
                "name": "firstName",
                "title": "First Name",
                "filterable": true,
            },
            {
                "name": "lastName",
                "title": "Last Name",
                "filterable": true,
            }
        ],
        "itemButtons": [
            {
                "title": "",
                "help": "Edit this item",
                "iconClass": "glyphicon-pencil",
                "url": webAPIURL + "?method=edit"
            },
            {
                "title": "",
                "help": "Delete this item",
                "cssClass": "danger",
                "iconClass": "glyphicon-trash",
                "askForConfirmation": true,
                "confirmationMessage": "Are you sure you want to do delete this entry?",
                "confirmationOk": "Yes, pretty sure",
                "confirmationCancel": "No, I'm having second thoughts",
                "url": webAPIURL + "?method=destroy"
            }
        ],
        "gridButtons": [
            {
                "title": "Reset data source",
                "cssClass": "primary",
                "url": webRoot + "demo/reset_session.php"
            },
            {
                "title": "Delete",
                "help": "Delete these items",
                "cssClass": "danger",
                "iconClass": "glyphicon-trash",
                "requiresSelection": true,
                "showCount": true,
                "askForConfirmation": true,
                "confirmationMessage": "Are you sure you want to do delete these entries?",
                "confirmationOk": "Yes, pretty sure",
                "confirmationCancel": "No, I'm having second thoughts",
                "url": webAPIURL + "?method=destroymany"
            }
        ]
    };

    $scope.webServiceDataSource=new WebServiceDataSource({
        dataUrl: webAPIURL,
        filterPrefix: 'filter-',
        filterValuesUrl: function(query) {
            return webAPIURL + '?method=getfilters&' + $.param(query) // later...
        }
    });
}]).

controller('FormCtrl', ['$scope', '$location', '$http', 'webAPIURL', function($scope, $location, $http, webAPIURL){
    $scope.dataUpdated=false;
    var id=parseInt($location.search().id);
    $http.get(webAPIURL, {params:{method:'show', id:id}}).success(function(data){
        $scope.data=data;
    });
    $scope.updateData=function(){
        $http({
            method:'POST',
            url:webAPIURL + '?method=update',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data:$.param({id:id, firstName:$scope.data.firstName, lastName:$scope.data.lastName, email:$scope.data.email})
        }).success(function(data){
            $scope.message=data.message;
            $scope.dataUpdated=true;
        });
    };
}]);
