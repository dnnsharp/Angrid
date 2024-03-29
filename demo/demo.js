$(function(){
    $('.panel-heading a').click(function(){
        $(this).parent().parent().toggleClass('collapsed', 300, 'swing');
        return false;
    });
    $('.nav-tabs a').click(function(e){
        e.preventDefault();
        $(this).tab('show');
    });
    $('pre').each(function(i, block){
        hljs.highlightBlock(block);
    });
});

angular.module('demoApp', ['angridApp']).

controller('DemoCtrl', ['$scope', function($scope){
    $scope.templateSettings={
        "grid": {
            "viewDirective": "angrid-grid-view",
            "viewUrl": "../src/views/grid/view.html"
        },
        "listing": {
            "viewDirective": "angrid-listing-view",
            "viewUrl": "../src/views/listing/view.html",
            "viewSettings": {
                "entriesPerRowMobile": 1,
                "entriesPerRowTablet": 3,
                "entriesPerRowDesktop": 2,
                "entriesPerRowLarge": 3
            }
        }
    };
    $scope.glyphicons=["glyphicon-asterisk", "glyphicon-plus", "glyphicon-euro", "glyphicon-minus", "glyphicon-cloud", "glyphicon-envelope", "glyphicon-pencil", "glyphicon-glass", "glyphicon-music", "glyphicon-search", "glyphicon-heart", "glyphicon-star", "glyphicon-star-empty", "glyphicon-user", "glyphicon-film", "glyphicon-th-large", "glyphicon-th", "glyphicon-th-list", "glyphicon-ok", "glyphicon-remove", "glyphicon-zoom-in", "glyphicon-zoom-out", "glyphicon-off", "glyphicon-signal", "glyphicon-cog", "glyphicon-trash", "glyphicon-home", "glyphicon-file", "glyphicon-time", "glyphicon-road", "glyphicon-download-alt", "glyphicon-download", "glyphicon-upload", "glyphicon-inbox", "glyphicon-play-circle", "glyphicon-repeat", "glyphicon-refresh", "glyphicon-list-alt", "glyphicon-lock", "glyphicon-flag", "glyphicon-headphones", "glyphicon-volume-off", "glyphicon-volume-down", "glyphicon-volume-up", "glyphicon-qrcode", "glyphicon-barcode", "glyphicon-tag", "glyphicon-tags", "glyphicon-book", "glyphicon-bookmark", "glyphicon-print", "glyphicon-camera", "glyphicon-font", "glyphicon-bold", "glyphicon-italic", "glyphicon-text-height", "glyphicon-text-width", "glyphicon-align-left", "glyphicon-align-center", "glyphicon-align-right", "glyphicon-align-justify", "glyphicon-list", "glyphicon-indent-left", "glyphicon-indent-right", "glyphicon-facetime-video", "glyphicon-picture", "glyphicon-map-marker", "glyphicon-adjust", "glyphicon-tint", "glyphicon-edit", "glyphicon-share", "glyphicon-check", "glyphicon-move", "glyphicon-step-backward", "glyphicon-fast-backward", "glyphicon-backward", "glyphicon-play", "glyphicon-pause", "glyphicon-stop", "glyphicon-forward", "glyphicon-fast-forward","glyphicon-step-forward", "glyphicon-eject", "glyphicon-chevron-left", "glyphicon-chevron-right", "glyphicon-plus-sign", "glyphicon-minus-sign", "glyphicon-remove-sign", "glyphicon-ok-sign", "glyphicon-question-sign", "glyphicon-info-sign", "glyphicon-screenshot", "glyphicon-remove-circle", "glyphicon-ok-circle", "glyphicon-ban-circle", "glyphicon-arrow-left", "glyphicon-arrow-right", "glyphicon-arrow-up", "glyphicon-arrow-down", "glyphicon-share-alt", "glyphicon-resize-full", "glyphicon-resize-small", "glyphicon-exclamation-sign", "glyphicon-gift", "glyphicon-leaf", "glyphicon-fire", "glyphicon-eye-open", "glyphicon-eye-close", "glyphicon-warning-sign", "glyphicon-plane", "glyphicon-calendar", "glyphicon-random", "glyphicon-comment", "glyphicon-magnet", "glyphicon-chevron-up", "glyphicon-chevron-down", "glyphicon-retweet", "glyphicon-shopping-cart", "glyphicon-folder-close", "glyphicon-folder-open", "glyphicon-resize-vertical", "glyphicon-resize-horizontal", "glyphicon-hdd", "glyphicon-bullhorn", "glyphicon-bell", "glyphicon-certificate", "glyphicon-thumbs-up","glyphicon-thumbs-down", "glyphicon-hand-right", "glyphicon-hand-left", "glyphicon-hand-up", "glyphicon-hand-down", "glyphicon-circle-arrow-right", "glyphicon-circle-arrow-left", "glyphicon-circle-arrow-up", "glyphicon-circle-arrow-down", "glyphicon-globe", "glyphicon-wrench", "glyphicon-tasks", "glyphicon-filter", "glyphicon-briefcase", "glyphicon-fullscreen", "glyphicon-dashboard", "glyphicon-paperclip", "glyphicon-heart-empty", "glyphicon-link", "glyphicon-phone", "glyphicon-pushpin", "glyphicon-usd", "glyphicon-gbp", "glyphicon-sort", "glyphicon-sort-by-alphabet", "glyphicon-sort-by-alphabet-alt", "glyphicon-sort-by-order", "glyphicon-sort-by-order-alt", "glyphicon-sort-by-attributes", "glyphicon-sort-by-attributes-alt", "glyphicon-unchecked", "glyphicon-expand", "glyphicon-collapse-down", "glyphicon-collapse-up", "glyphicon-log-in", "glyphicon-flash", "glyphicon-log-out", "glyphicon-new-window", "glyphicon-record", "glyphicon-save", "glyphicon-open", "glyphicon-saved", "glyphicon-import", "glyphicon-export", "glyphicon-send", "glyphicon-floppy-disk", "glyphicon-floppy-saved", "glyphicon-floppy-remove", "glyphicon-floppy-save", "glyphicon-floppy-open", "glyphicon-credit-card","glyphicon-transfer", "glyphicon-cutlery", "glyphicon-header", "glyphicon-compressed", "glyphicon-earphone", "glyphicon-phone-alt", "glyphicon-tower", "glyphicon-stats", "glyphicon-sd-video", "glyphicon-hd-video", "glyphicon-subtitles", "glyphicon-sound-stereo", "glyphicon-sound-dolby", "glyphicon-sound-5-1", "glyphicon-sound-6-1", "glyphicon-sound-7-1", "glyphicon-copyright-mark", "glyphicon-registration-mark", "glyphicon-cloud-download", "glyphicon-cloud-upload", "glyphicon-tree-conifer", "glyphicon-tree-deciduous"];
    $scope.iconsVisible=false;
    $scope.toggleIcons=function(){
        $scope.iconsVisible=!$scope.iconsVisible;
    };
    $scope.selectIcon=function(btn, icon){
        btn.iconClass=icon;
        $scope.iconsVisible=false;
    };
    $scope.clearIcon=function(btn){
        btn.iconClass=null;
    };
    $scope.template='grid';
    var settings=JSON.parse(JSON.stringify($scope.defaultSettings));
    $scope.settings=settings;
    $scope.changeTemplate=function(){
        var template=$scope.templateSettings[$scope.template];
        for(var attrName in template){$scope.settings[attrName]=template[attrName]};
    };
    $scope.changeTemplate();
}]);
