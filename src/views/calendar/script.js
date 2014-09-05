;
angrid.directive('angridCalendarView', ['$compile', '$timeout', '$parse', '$sce', function ($compile, $timeout, $parse, $sce) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: function(elem,attrs) {
            return attrs.angridCalendarView;
        },
        link: function (scope, element, attrs) {
        }
    };
}]);

