;
angrid.directive('angridGridView', ['$compile', '$timeout', '$parse', '$sce', function ($compile, $timeout, $parse, $sce) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: function(elem,attrs) {
            return attrs.angridGridView;
        },
        link: function (scope, element, attrs) {
        }
    };
}]);

