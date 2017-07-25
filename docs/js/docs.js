/* global angular */

(function() {
    "use strict";

    var app = angular.module('app', ['framework', 'jsonFormatter']);

    app.controller('FormCtrl', ['$scope', '$timeout', 'State', function($scope, $timeout, State) {

        $scope.onRemoveLanguage = onRemoveLanguage;
        $scope.submit = submit;
        $scope.submit2 = submit2;

        var state = $scope.state = new State();
        var state2 = $scope.state2 = new State();
        var model = $scope.model = {
            languages: [],
        };

        var data = $scope.data = {
            languages: [{
                id: 1,
                name: 'English'
            }, {
                id: 2,
                name: 'French'
            }, {
                id: 3,
                name: 'Deutsch'
            }, {
                id: 4,
                name: 'Espanol'
            }, {
                id: 5,
                name: 'Italian'
            }]
        };

        function onRemoveLanguage(item) {
            var i = model.languages.indexOf(item);
            if (i !== -1) {
                model.languages.splice(i, 1);
            }
        }

        function submit() {
            console.log('submit', model);
            if (state.busy()) {
                $timeout(function() {
                    if (Math.random() > 0.5) {
                        state.success();
                    } else {
                        state.error('errore!');
                    }
                }, 2500);
            }
        }

        function submit2() {
            console.log('submit2', model);
            if (state2.busy()) {
                $timeout(function() {
                    if (Math.random() > 0.5) {
                        state2.success();
                    } else {
                        state2.error('errore!');
                    }
                }, 2500);
            }
        }

        // state.ready();

    }]);

    app.filter('notIn', function($filter) {
        return function(array, filters, key) {
            console.log(array);
            return $filter("filter")(array, function(item) {
                if (filters) {
                    for (var i = 0; i < filters.length; i++) {
                        if (filters[i][key] === item[key]) {
                            return false;
                        }
                    }
                }
                return true;
            });
        };
    });

}());