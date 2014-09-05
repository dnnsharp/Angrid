;
angrid.directive('angridListingView', ['$compile', '$timeout', '$parse', '$sce', function ($compile, $timeout, $parse, $sce) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: function(elem,attrs) {
            return attrs.angridListingView;
        },
        link: function (scope, element, attrs) {

            scope.$sce = $sce;

            scope.makeTilesEven = function () {
                $.each(['heading', 'body', 'footer'], function (i, part) {
                    var maxHeight = 0;
                    $.each(element.find('.angrid-item>.panel>.panel-' + part), function () {
                        maxHeight = Math.max(maxHeight, $(this).height());
                    });
                    element.find('.angrid-item>.panel>.panel-' + part).height(maxHeight);
                });
            };

            // make all rows same size
            scope.$on('angrid.dataReceived', function () {
                $timeout(function () {
                    scope.makeTilesEven();
                }, 1000);
            });

        }
    };
}]);

