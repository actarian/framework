/* global angular */

(function() {
    "use strict";

    var app = angular.module('framework');

    app.directive('header', [function() {
        return {
            restrict: 'E',
            templateUrl: 'partials/header',
            transclude: {
                'header': '?headerItems',
            },
            link: function(scope, element, attributes, model) {}
        };
    }]);

}());