/* global angular */

var module = angular.module('framework', ['ng', 'ngMessages']);
/* global angular */

(function() {
    "use strict";

    var app = angular.module('framework');

    app.factory('Events', [function() {

        function Event(e, element) {
            var documentNode = (document.documentElement || document.body.parentNode || document.body);
            var scroll = {
                x: window.pageXOffset || documentNode.scrollLeft,
                y: window.pageYOffset || documentNode.scrollTop
            };
            if (e.type === 'resize') {
                var view = {
                    w: this.getWidth(),
                    h: this.getHeight(),
                };
                this.view = view;
            }
            var node = getNode(element);
            var offset = {
                x: node.offsetLeft,
                y: node.offsetTop,
            };
            var rect = node.getBoundingClientRect();
            var page = this.getPage(e);
            if (page) {
                var relative = {
                    x: page.x - scroll.x - rect.left,
                    y: page.y - scroll.y - rect.top,
                };
                var absolute = {
                    x: page.x - scroll.x,
                    y: page.y - scroll.y,
                };
                this.relative = relative;
                this.absolute = absolute;
            }
            if (this.type === 'resize') {
                console.log(this.type);
            }
            this.originalEvent = e;
            this.element = element;
            this.node = node;
            this.offset = offset;
            this.rect = rect;
            // console.log('Event', 'page', page, 'scroll', scroll, 'offset', offset, 'rect', rect, 'relative', relative, 'absolute', absolute);
            // console.log('scroll.y', scroll.y, 'page.y', page.y, 'offset.y', offset.y, 'rect.top', rect.top);
        }
        Event.prototype = {
            getPage: getPage,
            getWidth: getWidth,
            getHeight: getHeight,
        };

        function getWidth() {
            if (self.innerWidth) {
                return self.innerWidth;
            }
            if (document.documentElement && document.documentElement.clientWidth) {
                return document.documentElement.clientWidth;
            }
            if (document.body) {
                return document.body.clientWidth;
            }
        }

        function getHeight() {
            if (self.innerHeight) {
                return self.innerHeight;
            }
            if (document.documentElement && document.documentElement.clientHeight) {
                return document.documentElement.clientHeight;
            }
            if (document.body) {
                return document.body.clientHeight;
            }
        }

        function getPage(e) {
            var standardEvents = ['click', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu'];
            var touchEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
            var page = null;
            if (touchEvents.indexOf(e.type) !== -1) {
                var t = null;
                var event = e.originalEvent ? e.originalEvent : e;
                var touches = event.touches.length ? event.touches : event.changedTouches;
                if (touches && touches.length) {
                    t = touches[0];
                }
                if (t) {
                    page = {
                        x: t.pageX,
                        y: t.pageY,
                    };
                }
            } else if (standardEvents.indexOf(e.type) !== -1) {
                page = {
                    x: e.pageX,
                    y: e.pageY,
                };
            }
            this.type = e.type;
            return page;
        }

        function Events(element) {
            this.element = element;
            this.listeners = {};
            this.standardEvents = {
                click: {
                    key: 'click',
                    callback: onClick
                },
                down: {
                    key: 'mousedown',
                    callback: onMouseDown
                },
                move: {
                    key: 'mousemove',
                    callback: onMouseMove
                },
                up: {
                    key: 'mouseup',
                    callback: onMouseUp
                },
                resize: {
                    key: 'resize',
                    callback: onResize
                },
            };
            this.touchEvents = {
                down: {
                    key: 'touchstart',
                    callback: onTouchStart
                },
                move: {
                    key: 'touchmove',
                    callback: onTouchMove
                },
                up: {
                    key: 'touchend',
                    callback: onTouchEnd
                },
            };

            var scope = this;

            function onClick(e) {
                // console.log('onClick', e, scope);
                var event = new Event(e, scope.element);
                scope.listeners.click.apply(this, [event]);
            }

            function onMouseDown(e) {
                // console.log('onMouseDown', e);
                var event = new Event(e, scope.element);
                scope.listeners.down.apply(this, [event]);
                scope.removeTouchEvents();
            }

            function onMouseMove(e) {
                // console.log('onMouseMove', e);
                var event = new Event(e, scope.element);
                scope.listeners.move.apply(this, [event]);
            }

            function onMouseUp(e) {
                // console.log('onMouseUp', e);
                var event = new Event(e, scope.element);
                scope.listeners.up.apply(this, [event]);
            }

            function onResize(e) {
                console.log('onResize', e);
                var event = new Event(e, scope.element);
                scope.listeners.resize.apply(this, [event]);
            }

            function onTouchStart(e) {
                // console.log('onTouchStart', e);
                var event = new Event(e, scope.element);
                scope.listeners.down.apply(this, [event]);
                scope.removeStandardEvents();
            }

            function onTouchMove(e) {
                // console.log('onTouchMove', e);
                var event = new Event(e, scope.element);
                scope.listeners.move.apply(this, [event]);
            }

            function onTouchEnd(e) {
                // console.log('onTouchEnd', e);
                var event = new Event(e, scope.element);
                scope.listeners.up.apply(this, [event]);
            }
        }
        Events.prototype = {
            add: onAdd,
            remove: onRemove,
            removeStandardEvents: removeStandardEvents,
            removeTouchEvents: removeTouchEvents,
        };
        return Events;

        function getNode(element) {
            return element.length ? element[0] : element; // (element.length && (element[0] instanceOf Node || element[0] instanceOf HTMLElement)) ? element[0] : element;
        }

        function getElement(element) {
            return element.length ? element : angular.element(element); // (element.length && (element[0] instanceOf Node || element[0] instanceOf HTMLElement)) ? element : angular.element(element);
        }

        function onAdd(listeners) {
            var scope = this,
                standard = this.standardEvents,
                touch = this.touchEvents;
            var element = getElement(this.element),
                windowElement = angular.element(window);

            angular.forEach(listeners, function(callback, key) {
                if (scope.listeners[key]) {
                    var listener = {};
                    listener[key] = scope.listeners[key];
                    onRemove(listener);
                }
                scope.listeners[key] = callback;
                if (standard[key]) {
                    if (key === 'resize') {
                        windowElement.on(standard[key].key, standard[key].callback);
                    } else {
                        element.on(standard[key].key, standard[key].callback);
                    }
                }
                if (touch[key]) {
                    element.on(touch[key].key, touch[key].callback);
                }
            });
            return scope;
        }

        function onRemove(listeners) {
            var scope = this,
                standard = this.standardEvents,
                touch = this.touchEvents;
            var element = getElement(this.element),
                windowElement = angular.element(window);
            angular.forEach(listeners, function(callback, key) {
                if (standard[key]) {
                    if (key === 'resize') {
                        windowElement.off(standard[key].key, standard[key].callback);
                    } else {
                        element.off(standard[key].key, standard[key].callback);
                    }
                }
                if (touch[key]) {
                    element.off(touch[key].key, touch[key].callback);
                }
                scope.listeners[key] = null;
            });
            return scope;
        }

        function removeStandardEvents() {
            var scope = this,
                standard = scope.standardEvents,
                touch = scope.touchEvents;
            var element = getElement(scope.element);
            element.off('mousedown', standard.down.callback);
            element.off('mousemove', standard.move.callback);
            element.off('mouseup', standard.up.callback);
        }

        function removeTouchEvents() {
            var scope = this,
                standard = scope.standardEvents,
                touch = scope.touchEvents;
            var element = getElement(scope.element);
            element.off('touchstart', touch.down.callback);
            element.off('touchmove', touch.move.callback);
            element.off('touchend', touch.up.callback);
        }

    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('framework');

    app.directive('ngClick', ['Events', function(Events) {
        return {
            restrict: 'A',
            priority: 0,
            link: link
        };

        function link(scope, element, attributes, model) {
            element.addClass('material');
            var material = document.createElement('material');
            element[0].appendChild(material);

            function onClick(e) {
                element.removeClass('animate');
                void element.offsetWidth;
                // material.style.animationPlayState = "paused";
                material.style.left = e.relative.x + 'px';
                material.style.top = e.relative.y + 'px';
                setTimeout(function() {
                    element.addClass('animate');
                    setTimeout(function() {
                        element.removeClass('animate');
                    }, 1000);
                }, 10);
            }

            var listeners = {
                click: onClick,
            };
            var events = new Events(element).add(listeners);

            scope.$on('$destroy', function() {
                events.remove(listeners);
            });

        }
    }]);

}());
/* global angular, app, Autolinker */

(function() {
    "use strict";

    var app = angular.module('framework');

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('framework');

    app.directive('controlMessages', [function() {
        return {
            restrict: 'E',
            templateUrl: 'partials/framework/forms/messages',
            transclude: {
                'message': '?messageItems',
            },
            link: function(scope, element, attributes, model) {}
        };
    }]);

    app.directive('control', ['$parse', function($parse) {
        function formatLabel(string, prepend, expression) {
            string = string || '';
            prepend = prepend || '';
            var splitted = string.split(',');
            if (splitted.length > 1) {
                var formatted = splitted.shift();
                angular.forEach(splitted, function(value, index) {
                    if (expression) {
                        formatted = formatted.split('{' + index + '}').join('\' + ' + prepend + value + ' + \'');
                    } else {
                        formatted = formatted.split('{' + index + '}').join(prepend + value);
                    }
                });
                if (expression) {
                    return '\'' + formatted + '\'';
                } else {
                    return formatted;
                }
            } else {
                return prepend + string;
            }
        }
        var uniqueId = 0;
        return {
            restrict: 'A',
            templateUrl: function(element, attributes) {
                var template = 'partials/framework/forms/text';
                switch (attributes.control) {
                    case 'select':
                        template = 'partials/framework/forms/select';
                        break;
                }
                return template;
            },
            scope: {
                ngModel: '=',
                required: '=',
                form: '@',
                title: '@',
                placeholder: '@',
                source: '=?',
                key: '@?',
                label: '@?',
            },
            require: 'ngModel',
            transclude: true,
            link: {
                pre: function preLink(scope, element, attributes, controller, transclude) {
                    var label = scope.label = (scope.label ? scope.label : 'name');
                    var key = scope.key = (scope.key ? scope.key : 'id');
                    if (attributes.control === 'select') {
                        var filter = (attributes.filter ? '| ' + attributes.filter : '');
                        var optionLabel = formatLabel(label, 'item.', true);
                        scope.getOptions = function() {
                            return attributes.number ?
                                'item.' + key + ' as ' + optionLabel + ' disable when item.disabled for item in source ' + filter :
                                optionLabel + ' disable when item.disabled for item in source ' + filter + ' track by item.' + key;
                        };
                    }
                    var type = scope.type = attributes.control;
                    var form = scope.form = scope.form || 'form';
                    var title = scope.title = scope.title || 'untitled';
                    var placeholder = scope.placeholder = scope.placeholder || title;
                    var field = scope.field = title.replace(/[^0-9a-zA-Z]/g, "").split(' ').join('') + (++uniqueId);
                    scope.format = attributes.format || null;
                    scope.precision = attributes.precision || null;
                    scope.validate = attributes.validate || attributes.control;
                    scope.minLength = attributes.minLength || 0;
                    scope.maxLength = attributes.maxLength || Number.POSITIVE_INFINITY;
                    scope.min = attributes.min || null;
                    scope.max = attributes.max || null;
                    scope.options = $parse(attributes.options)(scope) || {};
                    scope.focus = false;
                    scope.visible = false;
                    scope.onChange = function(model) {
                        $parse(attributes.onChange)(scope.$parent);
                    };
                    scope.onFilter = function(model) {
                        $parse(attributes.onFilter)(scope.$parent);
                    };
                    scope.getType = function() {
                        var type = 'text';
                        switch (attributes.control) {
                            case 'password':
                                type = scope.visible ? 'text' : 'password';
                                break;
                            default:
                                type = attributes.control;
                        }
                        return type;
                    };
                    scope.getClasses = function() {
                        var form = $parse(scope.form)(scope.$parent);
                        var field = $parse(scope.form + '.' + scope.field)(scope.$parent);
                        return {
                            'control-focus': scope.focus,
                            'control-success': field.$valid,
                            'control-error': field.$invalid && (form.$submitted || field.$touched),
                            'control-empty': !field.$viewValue
                        };
                    };
                    scope.getMessages = function() {
                        var form = $parse(scope.form)(scope.$parent);
                        var field = $parse(scope.form + '.' + scope.field)(scope.$parent);
                        return (form.$submitted || field.$touched) && field.$error;
                    };
                    scope.toggleVisibility = function() {
                        scope.visible = !scope.visible;
                    };
                },
            },
        };
    }]);

    app.directive('_control', ['$http', '$templateCache', '$compile', '$parse', function($http, $templateCache, $compile, $parse) {
        function formatLabel(string, prepend, expression) {
            string = string || '';
            prepend = prepend || '';
            var splitted = string.split(',');
            if (splitted.length > 1) {
                var formatted = splitted.shift();
                angular.forEach(splitted, function(value, index) {
                    if (expression) {
                        formatted = formatted.split('{' + index + '}').join('\' + ' + prepend + value + ' + \'');
                    } else {
                        formatted = formatted.split('{' + index + '}').join(prepend + value);
                    }
                });
                if (expression) {
                    return '\'' + formatted + '\'';
                } else {
                    return formatted;
                }
            } else {
                return prepend + string;
            }
        }
        var uniqueId = 0;
        return {
            restrict: 'A',
            templateUrl: function(element, attributes) {
                var template = 'partials/framework/forms/text';
                switch (attributes.control) {
                    case 'select':
                        template = 'partials/framework/forms/select';
                        break;
                }
                return template;
            },
            scope: {
                ngModel: '=',
                required: '=',
                form: '@',
                title: '@',
                placeholder: '@',
            },
            require: 'ngModel',
            /*
            link: function(scope, element, attributes, model) {
            },
            */
            compile: function(element, attributes) {
                    return {
                        pre: function(scope, element, attributes) {
                            if (attributes.control === 'select') {
                                var label = (attributes.label ? attributes.label : 'name');
                                var key = (attributes.key ? attributes.key : 'id');
                                var filter = (attributes.min ? ' | filter:gte(\'' + key + '\', ' + attributes.min + ')' : '');
                                var optionLabel = formatLabel(label, 'item.', true);
                                scope.options = attributes.number ?
                                    'item.' + key + ' as ' + optionLabel + ' disable when item.disabled for item in ' + attributes.source + filter :
                                    optionLabel + ' disable when item.disabled for item in ' + attributes.source + filter + ' track by item.' + key;
                                console.log('control.compile.pre', scope.options);
                            }
                            var type = scope.type = attributes.control;
                            var form = scope.form = scope.form || 'form';
                            var title = scope.title = scope.title || 'untitled';
                            var placeholder = scope.placeholder = scope.placeholder || title;
                            var field = scope.field = title.replace(/[^0-9a-zA-Z]/g, "").split(' ').join('') + (++uniqueId);
                            scope.validate = attributes.validate || attributes.control;
                            scope.format = attributes.format || null;
                            scope.precision = attributes.precision || null;
                            scope.validate = attributes.validate || attributes.control;
                            scope.minLength = attributes.min || 0;
                            scope.maxLength = attributes.max || Number.POSITIVE_INFINITY;
                            scope.options = $parse(attributes.options)(scope) || {};
                            scope.focus = false;
                            scope.visible = false;
                            scope.getType = function() {
                                var type = 'text';
                                switch (attributes.control) {
                                    case 'password':
                                        // var form = $parse(scope.form)(scope.$parent);
                                        // var field = $parse(scope.form + '.' + scope.field)(scope.$parent);
                                        type = scope.visible ? 'text' : 'password';
                                        break;
                                    default:
                                        type = attributes.control;
                                }
                                // console.log('control.getType', type);
                                return type;
                            };
                            scope.getClasses = function() {
                                var form = $parse(scope.form)(scope.$parent);
                                var field = $parse(scope.form + '.' + scope.field)(scope.$parent);
                                return {
                                    'control-focus': scope.focus,
                                    'control-success': field.$valid,
                                    'control-error': field.$invalid && (form.$submitted || field.$touched),
                                    'control-empty': !field.$viewValue
                                };
                            };
                            scope.getMessages = function() {
                                var form = $parse(scope.form)(scope.$parent);
                                var field = $parse(scope.form + '.' + scope.field)(scope.$parent);
                                return (form.$submitted || field.$touched) && field.$error;
                            };
                        },
                        // post: function (scope, element, attributes) { }
                    };
                }
                /*
                compile: function(element, attributes) {
                    element.removeAttr('my-dir'); 
                    element.attr('ng-hide', 'true');
                    return function(scope) {
                        $compile(element)(scope);
                    };
                },
                */
        };
    }]);

    app.directive('numberPicker', ['$parse', '$timeout', function($parse, $timeout) {
        return {
            restrict: 'A',
            template: '<div class="input-group">' +
                '   <span class="input-group-btn"><button class="btn btn-outline-primary" type="button">-</button></span>' +
                '   <div ng-transclude></div>' +
                '   <span class="input-group-btn"><button class="btn btn-outline-primary" type="button">+</button></span>' +
                '</div>',
            replace: true,
            transclude: true,
            link: function(scope, element, attributes, model) {
                var node = element[0];
                var nodeRemove = node.querySelectorAll('.input-group-btn > .btn')[0];
                var nodeAdd = node.querySelectorAll('.input-group-btn > .btn')[1];

                function onRemove(e) {
                    var min = $parse(attributes.min)(scope);
                    var getter = $parse(attributes.numberPicker);
                    var setter = getter.assign;
                    $timeout(function() {
                        setter(scope, Math.max(min, getter(scope) - 1));
                    });
                    // console.log('numberPicker.onRemove', min);
                }

                function onAdd(e) {
                    var max = $parse(attributes.max)(scope);
                    var getter = $parse(attributes.numberPicker);
                    var setter = getter.assign;
                    $timeout(function() {
                        setter(scope, Math.min(max, getter(scope) + 1));
                    });
                    // console.log('numberPicker.onAdd', max);
                }

                function addListeners() {
                    angular.element(nodeRemove).on('touchstart mousedown', onRemove);
                    angular.element(nodeAdd).on('touchstart mousedown', onAdd);
                }

                function removeListeners() {
                    angular.element(nodeRemove).off('touchstart mousedown', onRemove);
                    angular.element(nodeAdd).off('touchstart mousedown', onAdd);
                }
                scope.$on('$destroy', function() {
                    removeListeners();
                });
                addListeners();
            }
        };
    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('framework');

    app.directive('validate', ['$filter', function($filter) {
        return {
            require: 'ngModel',
            link: function(scope, element, attributes, model) {
                var type = attributes.validate;
                var format = attributes.format || '';
                var precision = attributes.precision || 2;
                var focus = false;
                // console.log('validate', type);
                switch (type) {
                    case 'date':
                    case 'datetime':
                    case 'datetime-local':
                        model.$formatters.push(function(value) {
                            if (value) {
                                return $filter('date')(value, format);
                            } else {
                                return null;
                            }
                        });
                        break;
                    case 'number':
                        model.$parsers.unshift(function(value) {
                            var valid = false;
                            if (value !== undefined && value !== "") {
                                valid = String(value).indexOf(Number(value).toString()) !== -1; // isFinite(value); // 
                                value = Number(value);
                                model.$setValidity('number', valid);
                                if (valid) {
                                    model.$setValidity('positive', value >= 0.01);
                                    if (attributes.min !== undefined) {
                                        model.$setValidity('range', value >= Number(attributes.min));
                                    }
                                    if (attributes.max !== undefined) {
                                        model.$setValidity('range', value <= Number(attributes.max));
                                    }
                                }
                            } else {
                                valid = true;
                                value = Number(value);
                                model.$setValidity('number', true);
                                model.$setValidity('positive', true);
                                if (attributes.min !== undefined) {
                                    model.$setValidity('range', true);
                                }
                                if (attributes.max !== undefined) {
                                    model.$setValidity('range', true);
                                }
                            }
                            return value;
                        });
                        model.$formatters.push(function(value) {
                            if (value) {
                                return $filter('number')(value, precision) + ' ' + format;
                            } else {
                                return null;
                            }
                        });
                        break;
                    case 'anynumber':
                        model.$parsers.unshift(function(value) {
                            var valid = false;
                            if (value !== undefined && value !== "") {
                                valid = String(value).indexOf(Number(value).toString()) !== -1; // isFinite(value); // 
                                value = Number(value);
                                model.$setValidity('number', valid);
                                if (valid) {
                                    if (attributes.min !== undefined) {
                                        model.$setValidity('range', value >= Number(attributes.min));
                                    }
                                    if (attributes.max !== undefined) {
                                        model.$setValidity('range', value <= Number(attributes.max));
                                    }
                                }
                            } else {
                                valid = true;
                                value = Number(value);
                                model.$setValidity('number', true);
                                if (attributes.min !== undefined) {
                                    model.$setValidity('range', true);
                                }
                                if (attributes.max !== undefined) {
                                    model.$setValidity('range', true);
                                }
                            }
                            return value;
                        });
                        model.$formatters.push(function(value) {
                            if (value || value === 0) {
                                return $filter('number')(value, precision) + ' ' + format;
                            } else {
                                return null;
                            }
                        });
                        break;
                }

                function onFocus() {
                    focus = true;
                    if (format) {
                        element[0].value = model.$modelValue || null;
                        if (!model.$modelValue) {
                            model.$setViewValue(null);
                        }
                    }
                }

                function doBlur() {
                    if (format && !model.$invalid) {
                        switch (type) {
                            case 'date':
                            case 'datetime':
                            case 'datetime-local':
                                element[0].value = model.$modelValue ? $filter('date')(model.$modelValue, format) : ' ';
                                break;
                            default:
                                element[0].value = model.$modelValue ? $filter('number')(model.$modelValue, precision) + ' ' + format : ' ';
                                break;
                        }
                    }
                }

                function onBlur() {
                    focus = false;
                    doBlur();
                }

                function addListeners() {
                    element.on('focus', onFocus);
                    element.on('blur', onBlur);
                }

                function removeListeners() {
                    element.off('focus', onFocus);
                    element.off('blur', onBlur);
                }
                scope.$on('$destroy', function() {
                    removeListeners();
                });
                addListeners();
            }
        };
    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('framework');

    app.factory('Hash', [function() {
        var pools = {};

        function Hash(key, pool) {
            key = key || 'id';
            pool = pool ? Hash.get(pool) : {};
            Object.defineProperties(this, {
                key: {
                    value: key,
                    enumerable: false,
                    writable: false
                },
                pool: {
                    value: pool,
                    enumerable: false,
                    writable: false
                },
                length: {
                    value: 0,
                    enumerable: false,
                    writable: true
                }
            });
        }
        Hash.get = function(pool) {
            return (pools[pool] = pools[pool] || {});
        };
        Hash.prototype = new Array;
        Hash.prototype.has = has;
        Hash.prototype.getId = getId;
        Hash.prototype.get = get;
        Hash.prototype.set = set;
        Hash.prototype.add = add;
        Hash.prototype.remove = remove;
        Hash.prototype.each = each;
        Hash.prototype.addMany = addMany;
        Hash.prototype.removeMany = removeMany;
        Hash.prototype.removeAll = removeAll;
        Hash.prototype.forward = forward;
        Hash.prototype.backward = backward;
        Hash.prototype.differs = differs;
        Hash.prototype.updatePool = updatePool;
        return Hash;

        function has(id) {
            return this.pool[id] !== undefined;
        }

        function getId(id) {
            return this.pool[id];
        }

        function get(item) {
            var hash = this,
                key = this.key;
            return item ? hash.getId(item[key]) : null;
        }

        function set(item) {
            var hash = this,
                pool = this.pool,
                key = this.key;
            pool[item[key]] = item;
            hash.push(item);
            return item;
        }

        function add(newItem) {
            var hash = this;
            var item = hash.get(newItem);
            if (item) {
                for (var i = 0, keys = Object.keys(newItem), p; i < keys.length; i++) {
                    p = keys[i];
                    item[p] = newItem[p];
                }
            } else {
                item = hash.set(newItem);
            }
            return item;
        }

        function remove(oldItem) {
            var hash = this,
                pool = this.pool,
                key = this.key;
            var item = hash.get(oldItem);
            if (item) {
                var index = hash.indexOf(item);
                if (index !== -1) {
                    hash.splice(index, 1);
                }
                delete pool[item[key]];
            }
            return hash;
        }

        function addMany(items) {
            var hash = this;
            if (!items) {
                return hash;
            }
            var i = 0;
            while (i < items.length) {
                hash.add(items[i]);
                i++;
            }
            return hash;
        }

        function removeMany(items) {
            var hash = this;
            if (!items) {
                return hash;
            }
            var i = 0;
            while (i < items.length) {
                hash.remove(items[i]);
                i++;
            }
            return hash;
        }

        function removeAll() {
            var hash = this,
                key = hash.key,
                pool = hash.pool;
            var i = 0,
                t = hash.length,
                item;
            while (hash.length) {
                item = hash.shift();
                delete pool[item[key]];
                i++;
            }
            return hash;
        }

        function each(callback) {
            var hash = this;
            if (callback) {
                var i = 0;
                while (i < hash.length) {
                    callback(hash[i], i);
                    i++;
                }
            }
            return hash;
        }

        function forward(key, reverse) {
            var hash = this;
            key = (key || this.key);
            hash.sort(function(c, d) {
                var a = reverse ? d : c;
                var b = reverse ? c : d;
                return a[key] - b[key];
            });
            return hash;
        }

        function backward(key) {
            return this.forward(key, true);
        }

        function differs(hash) {
            if (hash.key !== this.key || hash.length !== this.length) {
                return true;
            } else {
                var differs = false,
                    i = 0,
                    t = this.length,
                    key = this.key;
                while (differs && i < t) {
                    differs = this[i][key] !== hash[i][key];
                    i++;
                }
            }
        }

        function updatePool() {
            var hash = this,
                pool = this.pool,
                key = this.key;
            Object.keys(pool).forEach(function(key) {
                delete pool[key];
            });
            angular.forEach(hash, function(item) {
                pool[item[key]] = item;
            });
        }

    }]);

}());
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
/* global angular */

(function() {
    "use strict";

    var app = angular.module('framework');

    app.service('Router', ['$location', '$timeout', function($location, $timeout) {

        var service = this;
        service.redirect = redirect;
        service.path = path;
        service.apply = apply;

        function redirect(path, msecs) {
            function doRedirect() {
                $location.$$lastRequestedPath = $location.path();
                $location.path(path);
            }
            if (msecs) {
                $timeout(function() {
                    doRedirect();
                }, msecs);
            } else {
                doRedirect();
            }
        }

        function path(path, msecs) {
            function doRetry() {
                path = $location.$$lastRequestedPath || path;
                $location.$$lastRequestedPath = null;
                $location.path(path);
            }
            if (msecs) {
                $timeout(function() {
                    doRetry();
                }, msecs);
            } else {
                doRetry();
            }
        }

        function apply(path, msecs) {
            function doRetry() {
                $location.path(path);
            }
            if (msecs) {
                $timeout(function() {
                    doRetry();
                }, msecs);
            } else {
                $timeout(function() {
                    doRetry();
                });
            }
        }

    }]);

}());
/* global angular */

(function() {
    // "use strict";

    var app = angular.module('framework');


    app.factory('State', ['$timeout', function($timeout) {
        var DELAY = 2000;

        function State() {
            this.isReady = false;
            this.idle();
        }
        State.prototype = {
            idle: idle,
            busy: busy,
            enabled: enabled,
            error: error,
            ready: ready,
            success: success,
            errorMessage: errorMessage,
            submitClass: submitClass,
            labels: labels,
            classes: classes
        };
        return State;

        function idle() {
            this.isBusy = false;
            this.isError = false;
            this.isErroring = false;
            this.isSuccess = false;
            this.isSuccessing = false;
            this.button = null;
            this.errors = [];
        }

        function enabled() {
            return !this.isBusy && !this.isErroring && !this.isSuccessing;
        }

        function busy() {
            if (!this.isBusy) {
                this.isBusy = true;
                this.isError = false;
                this.isErroring = false;
                this.isSuccess = false;
                this.isSuccessing = false;
                this.errors = [];
                // console.log('State.busy', this);
                return true;
            } else {
                return false;
            }
        }

        function success() {
            this.isBusy = false;
            this.isError = false;
            this.isErroring = false;
            this.isSuccess = true;
            this.isSuccessing = true;
            this.errors = [];
            $timeout(function() {
                this.ready();
            }.bind(this), DELAY);
        }

        function error(error) {
            this.isBusy = false;
            this.isError = true;
            this.isErroring = true;
            this.isSuccess = false;
            this.isSuccessing = false;
            this.errors.push(error);
            $timeout(function() {
                this.ready();
            }.bind(this), DELAY);
        }

        function ready() {
            this.idle();
            this.isReady = true;
        }

        function errorMessage() {
            return this.isError ? this.errors[this.errors.length - 1] : null;
        }

        function submitClass() {
            return {
                busy: this.isBusy,
                ready: this.isReady,
                successing: this.isSuccessing,
                success: this.isSuccess,
                errorring: this.isErroring,
                error: this.isError,
            };
        }

        function labels(addons) {
            var scope = this;
            var defaults = {
                ready: 'submit',
                busy: 'sending',
                error: 'error',
                success: 'success',
            };
            if (addons) {
                angular.extend(defaults, addons);
            }
            var label = defaults.ready;
            if (this.isBusy) {
                label = defaults.busy;
            } else if (this.isSuccess) {
                label = defaults.success;
            } else if (this.isError) {
                label = defaults.error;
            }
            return label;
        }

        function classes(addons) {
            var scope = this,
                classes = null;
            classes = {
                ready: scope.isReady,
                busy: scope.isBusy,
                successing: scope.isSuccessing,
                success: scope.isSuccess,
                errorring: scope.isErroring,
                error: scope.isError,
            };
            if (addons) {
                angular.forEach(addons, function(value, key) {
                    classes[value] = classes[key];
                });
            }
            // console.log('stateClass', classes);
            return classes;
        }

    }]);

    app.factory('_State', ['$timeout', function($timeout) {
        var DELAY = 2000;

        function State() {
            this.isReady = false;
            this.idle();
        }
        State.prototype = {
            idle: idle,
            busy: busy,
            enabled: enabled,
            error: error,
            ready: ready,
            success: success,
            errorMessage: errorMessage,
            submitClass: submitClass,
            labels: labels,
            classes: classes,
            disabled: disabled
        };
        return State;

        function idle() {
            this.isBusy = false;
            this.isError = false;
            this.isErroring = false;
            this.isSuccess = false;
            this.isSuccessing = false;
            this.button = null;
            this.errors = [];
        }

        function enabled() {
            return !this.isBusy && !this.isErroring && !this.isSuccessing;
        }

        function busy(key) {
            if (!this.isBusy) {
                this.isBusy = true;
                this.isError = false;
                this.isErroring = false;
                this.isSuccess = false;
                this.isSuccessing = false;
                this.errors = [];
                this.key = key;
                // console.log('State.busy', this);
                return true;
            } else {
                return false;
            }
        }

        function success() {
            this.isBusy = false;
            this.isError = false;
            this.isErroring = false;
            this.isSuccess = true;
            this.isSuccessing = true;
            this.errors = [];
            $timeout(function() {
                this.isSuccessing = false;
                this.key = null;
            }.bind(this), DELAY);
        }

        function error(error) {
            this.isBusy = false;
            this.isError = true;
            this.isErroring = true;
            this.isSuccess = false;
            this.isSuccessing = false;
            this.errors.push(error);
            $timeout(function() {
                this.isErroring = false;
                this.key = null;
            }.bind(this), DELAY);
        }

        function ready() {
            this.isReady = true;
            this.success();
        }

        function errorMessage() {
            return this.isError ? this.errors[this.errors.length - 1] : null;
        }

        function submitClass() {
            return {
                busy: this.isBusy,
                ready: this.isReady,
                successing: this.isSuccessing,
                success: this.isSuccess,
                errorring: this.isErroring,
                error: this.isError,
            };
        }

        function labels(key, addons) {
            var scope = this;
            var defaults = {
                ready: 'submit',
                busy: 'sending',
                error: 'error',
                success: 'success',
            };
            if (addons) {
                angular.extend(defaults, addons);
            }
            var label = defaults.ready;
            // console.log('labels', scope.key, key);
            if (this.key === key) {
                if (this.isBusy) {
                    label = defaults.busy;
                } else if (this.isSuccess) {
                    label = defaults.success;
                } else if (this.isError) {
                    label = defaults.error;
                }
            }
            return label;
        }

        function classes(key, addons) {
            var scope = this,
                classes = null;
            // console.log('stateClass', scope.key, key);
            if (this.key === key) {
                classes = {
                    ready: scope.isReady,
                    busy: scope.isBusy,
                    successing: scope.isSuccessing,
                    success: scope.isSuccess,
                    errorring: scope.isErroring,
                    error: scope.isError,
                };
                if (addons) {
                    angular.forEach(addons, function(value, key) {
                        classes[value] = classes[key];
                    });
                }
            }
            // console.log('stateClass', classes);
            return classes;
        }

        function disabled(key) {
            // console.log('disabled', key, this.key);
            return (this.key && this.key !== key);
        }
    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('framework');

    app.factory('Cookie', ['$q', '$window', function($q, $window) {
        function Cookie() {}
        Cookie.TIMEOUT = 5 * 60 * 1000; // five minutes
        Cookie._set = function(name, value, days) {
            var expires;
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = '; expires=' + date.toGMTString();
            } else {
                expires = '';
            }
            $window.document.cookie = name + '=' + value + expires + '; path=/';
        };
        Cookie.set = function(name, value, days) {
            try {
                var cache = [];
                var json = JSON.stringify(value, function(key, value) {
                    if (key === 'pool') {
                        return;
                    }
                    if (typeof value === 'object' && value !== null) {
                        if (cache.indexOf(value) !== -1) {
                            // Circular reference found, discard key
                            return;
                        }
                        cache.push(value);
                    }
                    return value;
                });
                cache = null;
                Cookie._set(name, json, days);
            } catch (e) {
                console.log('Cookie.set.error serializing', name, value, e);
            }
        };
        Cookie.get = function(name) {
            var cookieName = name + "=";
            var ca = $window.document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(cookieName) === 0) {
                    var value = c.substring(cookieName.length, c.length);
                    var model = null;
                    try {
                        model = JSON.parse(value);
                    } catch (e) {
                        console.log('Cookie.get.error parsing', key, e);
                    }
                    return model;
                }
            }
            return null;
        };
        Cookie.delete = function(name) {
            Cookie._set(name, "", -1);
        };
        Cookie.on = function(name) {
            var deferred = $q.defer();
            var i, interval = 1000,
                elapsed = 0,
                timeout = Cookie.TIMEOUT;

            function checkCookie() {
                if (elapsed > timeout) {
                    deferred.reject('timeout');
                } else {
                    var c = Cookie.get(name);
                    if (c) {
                        deferred.resolve(c);
                    } else {
                        elapsed += interval;
                        i = setTimeout(checkCookie, interval);
                    }
                }
            }
            checkCookie();
            return deferred.promise;
        };
        return Cookie;
    }]);

    app.factory('LocalStorage', ['$q', '$window', 'Cookie', function($q, $window, Cookie) {
        function LocalStorage() {}

        function isLocalStorageSupported() {
            var supported = false;
            try {
                supported = 'localStorage' in $window && $window.localStorage !== null;
                if (supported) {
                    $window.localStorage.setItem('test', '1');
                    $window.localStorage.removeItem('test');
                } else {
                    supported = false;
                }
            } catch (e) {
                supported = false;
            }
            return supported;
        }
        LocalStorage.isSupported = isLocalStorageSupported();
        if (LocalStorage.isSupported) {
            LocalStorage.set = function(name, value) {
                try {
                    var cache = [];
                    var json = JSON.stringify(value, function(key, value) {
                        if (key === 'pool') {
                            return;
                        }
                        if (typeof value === 'object' && value !== null) {
                            if (cache.indexOf(value) !== -1) {
                                // Circular reference found, discard key
                                return;
                            }
                            cache.push(value);
                        }
                        return value;
                    });
                    cache = null;
                    $window.localStorage.setItem(name, json);
                } catch (e) {
                    console.log('LocalStorage.set.error serializing', name, value, e);
                }
            };
            LocalStorage.get = function(name) {
                var value = null;
                if ($window.localStorage[name] !== undefined) {
                    try {
                        value = JSON.parse($window.localStorage[name]);
                    } catch (e) {
                        console.log('LocalStorage.get.error parsing', name, e);
                    }
                }
                return value;
            };
            LocalStorage.delete = function(name) {
                $window.localStorage.removeItem(name);
            };
            LocalStorage.on = function(name) {
                var deferred = $q.defer();
                var i, timeout = Cookie.TIMEOUT;

                function storageEvent(e) {
                    // console.log('LocalStorage.on', name, e);
                    clearTimeout(i);
                    if (e.originalEvent.key == name) {
                        try {
                            var value = JSON.parse(e.originalEvent.newValue); // , e.originalEvent.oldValue
                            deferred.resolve(value);
                        } catch (error) {
                            console.log('LocalStorage.on.error parsing', name, error);
                            deferred.reject('error parsing ' + name);
                        }
                    }
                }
                angular.element($window).on('storage', storageEvent);
                i = setTimeout(function() {
                    deferred.reject('timeout');
                }, timeout);
                return deferred.promise;
            };
        } else {
            console.log('LocalStorage.unsupported switching to cookies');
            LocalStorage.set = Cookie.set;
            LocalStorage.get = Cookie.get;
            LocalStorage.delete = Cookie.delete;
            LocalStorage.on = Cookie.on;
        }
        return LocalStorage;
    }]);

    app.factory('SessionStorage', ['$q', '$window', 'Cookie', function($q, $window, Cookie) {
        function SessionStorage() {}

        function isSessionStorageSupported() {
            var supported = false;
            try {
                supported = 'sessionStorage' in $window && $window.sessionStorage !== undefined;
                if (supported) {
                    $window.sessionStorage.setItem('test', '1');
                    $window.sessionStorage.removeItem('test');
                } else {
                    supported = false;
                }
            } catch (e) {
                supported = false;
            }
            return supported;
        }
        SessionStorage.isSupported = isSessionStorageSupported();
        if (SessionStorage.isSupported) {
            SessionStorage.set = function(name, value) {
                try {
                    var cache = [];
                    var json = JSON.stringify(value, function(key, value) {
                        if (key === 'pool') {
                            return;
                        }
                        if (typeof value === 'object' && value !== null) {
                            if (cache.indexOf(value) !== -1) {
                                // Circular reference found, discard key
                                return;
                            }
                            cache.push(value);
                        }
                        return value;
                    });
                    cache = null;
                    $window.sessionStorage.setItem(name, json);
                } catch (e) {
                    console.log('SessionStorage.set.error serializing', name, value, e);
                }
            };
            SessionStorage.get = function(name) {
                var value = null;
                if ($window.sessionStorage[name] !== undefined) {
                    try {
                        value = JSON.parse($window.sessionStorage[name]);
                    } catch (e) {
                        console.log('SessionStorage.get.error parsing', name, e);
                    }
                }
                return value;
            };
            SessionStorage.delete = function(name) {
                $window.sessionStorage.removeItem(name);
            };
            SessionStorage.on = function(name) {
                var deferred = $q.defer();
                var i, timeout = Cookie.TIMEOUT;

                function storageEvent(e) {
                    // console.log('SessionStorage.on', name, e);
                    clearTimeout(i);
                    if (e.originalEvent.key === name) {
                        try {
                            var value = JSON.parse(e.originalEvent.newValue); // , e.originalEvent.oldValue
                            deferred.resolve(value);
                        } catch (error) {
                            console.log('SessionStorage.on.error parsing', name, error);
                            deferred.reject('error parsing ' + name);
                        }
                    }
                }
                angular.element($window).on('storage', storageEvent);
                i = setTimeout(function() {
                    deferred.reject('timeout');
                }, timeout);
                return deferred.promise;
            };
        } else {
            console.log('SessionStorage.unsupported switching to cookies');
            SessionStorage.set = Cookie.set;
            SessionStorage.get = Cookie.get;
            SessionStorage.delete = Cookie.delete;
            SessionStorage.on = Cookie.on;
        }
        return SessionStorage;
    }]);

}());
/* global angular */

(function() {
    "use strict";

    var app = angular.module('framework');

    app.factory('Vector', function() {
        function Vector(x, y) {
            this.x = x || 0;
            this.y = y || 0;
        }
        Vector.make = function(a, b) {
            return new Vector(b.x - a.x, b.y - a.y);
        };
        Vector.size = function(a) {
            return Math.sqrt(a.x * a.x + a.y * a.y);
        };
        Vector.normalize = function(a) {
            var l = Vector.size(a);
            a.x /= l;
            a.y /= l;
            return a;
        };
        Vector.incidence = function(a, b) {
            var angle = Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
            // if (angle < 0) angle += 2 * Math.PI;
            // angle = Math.min(angle, (Math.PI * 2 - angle));
            return angle;
        };
        Vector.distance = function(a, b) {
            return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
        };
        Vector.cross = function(a, b) {
            return (a.x * b.y) - (a.y * b.x);
        };
        Vector.difference = function(a, b) {
            return new Vector(a.x - b.x, a.y - b.y);
        };
        Vector.power = function(a, b) {
            var x = Math.abs(b.x - a.x);
            var y = Math.abs(b.y - a.y);
            return (x + y) / 2;
        };
        Vector.prototype = {
            size: function() {
                return Vector.size(this);
            },
            normalize: function() {
                return Vector.normalize(this);
            },
            incidence: function(b) {
                return Vector.incidence(this, b);
            },
            cross: function(b) {
                return Vector.cross(this, b);
            },
            distance: function(b) {
                return Vector.distance(this, b);
            },
            difference: function(b) {
                return Vector.difference(this, b);
            },
            power: function() {
                return (Math.abs(this.x) + Math.abs(this.y)) / 2;
            },
            towards: function(b, friction) {
                friction = friction || 0.125;
                this.x += (b.x - this.x) * friction;
                this.y += (b.y - this.y) * friction;
                return this;
            },
            add: function(b) {
                this.x += b.x;
                this.y += b.y;
                return this;
            },
            friction: function(b) {
                this.x *= b;
                this.y *= b;
                return this;
            },
            copy: function(b) {
                return new Vector(this.x, this.y);
            },
            toString: function() {
                return '{' + this.x + ',' + this.y + '}';
            },
        };
        return Vector;
    });

    app.factory('Utils', ['$compile', '$controller', 'Vector', function($compile, $controller, Vector) {
        (function() {
            // POLYFILL window.requestAnimationFrame
            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
                    window[vendors[x] + 'CancelRequestAnimationFrame'];
            }
            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = function(callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
            }
            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function(id) {
                    clearTimeout(id);
                };
            }
        }());
        (function() {
            // POLYFILL Array.prototype.reduce
            // Production steps of ECMA-262, Edition 5, 15.4.4.21
            // Reference: http://es5.github.io/#x15.4.4.21
            // https://tc39.github.io/ecma262/#sec-array.prototype.reduce
            if (!Array.prototype.reduce) {
                Object.defineProperty(Array.prototype, 'reduce', {
                    value: function(callback) { // , initialvalue
                        if (this === null) {
                            throw new TypeError('Array.prototype.reduce called on null or undefined');
                        }
                        if (typeof callback !== 'function') {
                            throw new TypeError(callback + ' is not a function');
                        }
                        var o = Object(this);
                        var len = o.length >>> 0;
                        var k = 0;
                        var value;
                        if (arguments.length == 2) {
                            value = arguments[1];
                        } else {
                            while (k < len && !(k in o)) {
                                k++;
                            }
                            if (k >= len) {
                                throw new TypeError('Reduce of empty array with no initial value');
                            }
                            value = o[k++];
                        }
                        while (k < len) {
                            if (k in o) {
                                value = callback(value, o[k], k, o);
                            }
                            k++;
                        }
                        return value;
                    }
                });
            }
        }());
        var _isTouch;
        var getNow = Date.now || function() {
            return new Date().getTime();
        };
        var ua = window.navigator.userAgent.toLowerCase();
        var safari = ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1;
        var msie = ua.indexOf('trident') !== -1 || ua.indexOf('edge') !== -1 || ua.indexOf('msie') !== -1;
        var chrome = !safari && !msie && ua.indexOf('chrome') !== -1;
        var mobile = ua.indexOf('mobile') !== -1;
        var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
        var isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;

        function Utils() {}
        Utils.reverseSortOn = reverseSortOn;
        Utils.getTouch = getTouch;
        Utils.getRelativeTouch = getRelativeTouch;
        Utils.getClosest = getClosest;
        Utils.getClosestElement = getClosestElement;
        Utils.throttle = throttle;
        Utils.where = where;
        Utils.format = format;
        Utils.compileController = compileController;
        Utils.reducer = reducer;
        Utils.reducerSetter = reducerSetter;
        Utils.reducerAdder = reducerAdder;
        Utils.downloadFile = downloadFile;
        Utils.serverDownload = serverDownload;
        Utils.toMd5 = function(string) {
            return Md5.encode(string);
        };
        Utils.ua = {
            safari: safari,
            msie: msie,
            chrome: chrome,
            mobile: mobile,
        };
        angular.forEach(Utils.ua, function(value, key) {
            if (value) {
                angular.element(document.getElementsByTagName('body')).addClass(key);
            }
        });
        return Utils;

        function isTouch() {
            if (!_isTouch) {
                _isTouch = {
                    value: ('ontouchstart' in window || 'onmsgesturechange' in window)
                };
            }
            // console.log(_isTouch);
            return _isTouch.value;
        }

        function getTouch(e, previous) {
            var t = new Vector();
            if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel') {
                var touch = null;
                var event = e.originalEvent ? e.originalEvent : e;
                var touches = event.touches.length ? event.touches : event.changedTouches;
                if (touches && touches.length) {
                    touch = touches[0];
                }
                if (touch) {
                    t.x = touch.pageX;
                    t.y = touch.pageY;
                }
            } else if (e.type === 'click' || e.type === 'mousedown' || e.type === 'mouseup' || e.type === 'mousemove' || e.type === 'mouseover' || e.type === 'mouseout' || e.type === 'mouseenter' || e.type === 'mouseleave' || e.type === 'contextmenu') {
                t.x = e.pageX;
                t.y = e.pageY;
            }
            if (previous) {
                t.s = Vector.difference(t, previous);
            }
            t.type = e.type;
            return t;
        }

        function getRelativeTouch(node, point) {
            var element = angular.element(node); // passing through jqlite for accepting both
            node = element[0];
            var rect = node.getBoundingClientRect();
            // var e = new Vector(rect.left + node.scrollLeft, rect.top + node.scrollTop);
            var e = new Vector(rect.left, rect.top);
            return Vector.difference(point, e);
        }

        function getClosest(el, selector) {
            var matchesFn, parent;
            ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'].some(function(fn) {
                if (typeof document.body[fn] == 'function') {
                    matchesFn = fn;
                    return true;
                }
                return false;
            });
            if (el[matchesFn](selector)) {
                return el;
            }
            while (el !== null) {
                parent = el.parentElement;
                if (parent !== null && parent[matchesFn](selector)) {
                    return parent;
                }
                el = parent;
            }
            return null;
        }

        function getClosestElement(el, target) {
            var matchesFn, parent;
            if (el === target) {
                return el;
            }
            while (el !== null) {
                parent = el.parentElement;
                if (parent !== null && parent === target) {
                    return parent;
                }
                el = parent;
            }
            return null;
        }

        function throttle(func, wait, options) {
            // Returns a function, that, when invoked, will only be triggered at most once
            // during a given window of time. Normally, the throttled function will run
            // as much as it can, without ever going more than once per `wait` duration;
            // but if you'd like to disable the execution on the leading edge, pass
            // `{leading: false}`. To disable execution on the trailing edge, ditto.
            var context, args, result;
            var timeout = null;
            var previous = 0;
            if (!options) options = {};
            var later = function() {
                previous = options.leading === false ? 0 : getNow();
                timeout = null;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            };
            return function() {
                var now = getNow();
                if (!previous && options.leading === false) previous = now;
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0 || remaining > wait) {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    previous = now;
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        }

        function where(array, query) {
            var found = null;
            if (array) {
                angular.forEach(array, function(item) {
                    var has = true;
                    angular.forEach(query, function(value, key) {
                        has = has && item[key] === value;
                    });
                    if (has) {
                        found = item;
                    }
                });
            }
            return found;
        }

        function compileController(scope, element, html, data) {
            // console.log('Utils.compileController', element);
            element.html(html);
            var link = $compile(element.contents());
            if (data.controller) {
                var $scope = scope.$new();
                angular.extend($scope, data);
                var controller = $controller(data.controller, { $scope: $scope });
                if (data.controllerAs) {
                    scope[data.controllerAs] = controller;
                }
                element.data('$ngControllerController', controller);
                element.children().data('$ngControllerController', controller);
                scope = $scope;
            }
            link(scope);
        }

        function reverseSortOn(key) {
            return function(a, b) {
                if (a[key] < b[key]) {
                    return 1;
                }
                if (a[key] > b[key]) {
                    return -1;
                }
                // a must be equal to b
                return 0;
            };
        }

        function format(string, prepend, expression) {
            string = string || '';
            prepend = prepend || '';
            var splitted = string.split(',');
            if (splitted.length > 1) {
                var formatted = splitted.shift();
                angular.forEach(splitted, function(value, index) {
                    if (expression) {
                        formatted = formatted.split('{' + index + '}').join('\' + ' + prepend + value + ' + \'');
                    } else {
                        formatted = formatted.split('{' + index + '}').join(prepend + value);
                    }
                });
                if (expression) {
                    return '\'' + formatted + '\'';
                } else {
                    return formatted;
                }
            } else {
                return prepend + string;
            }
        }

        function reducer(o, key) {
            return o[key];
        }

        function reducerSetter(o, key, value) {
            if (typeof key == 'string') {
                return reducerSetter(o, key.split('.'), value);
            } else if (key.length == 1 && value !== undefined) {
                return (o[key[0]] = value);
            } else if (key.length === 0) {
                return o;
            } else {
                return reducerSetter(o[key[0]], key.slice(1), value);
            }
        }

        function reducerAdder(o, key, value) {
            if (typeof key == 'string') {
                return reducerAdder(o, key.split('.'), value);
            } else if (key.length == 1 && value !== undefined) {
                return (o[key[0]] += value);
            } else if (key.length === 0) {
                return o;
            } else {
                return reducerAdder(o[key[0]], key.slice(1), value);
            }
        }

        function downloadFile(content, name, type) {
            type = type || 'application/octet-stream';
            var base64 = null;
            var blob = new Blob([content], { type: type });
            var reader = new window.FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function() {
                base64 = reader.result;
                download();
            };

            function download() {
                // If in Chrome or Safari - download via virtual link click
                // if (isChrome || isSafari) {
                //Creating new link node.
                if (document.createEvent) {
                    var anchor = document.createElement('a');
                    anchor.href = base64;
                    if (anchor.download !== undefined) {
                        //Set HTML5 download attribute. This will prevent file from opening if supported.
                        var downloadName = name || base64.substring(base64.lastIndexOf('/') + 1, base64.length);
                        anchor.download = downloadName;
                    }
                    //Dispatching click event.
                    var event = document.createEvent('MouseEvents');
                    event.initEvent('click', true, true);
                    anchor.dispatchEvent(event);
                    return true;
                }
                // }
                // Force file download (whether supported by server).
                var query = '?download';
                window.open(base64.indexOf('?') > -1 ? base64 : base64 + query, '_self');
            }

            function __download() {
                var supportsDownloadAttribute = 'download' in document.createElement('a');
                if (supportsDownloadAttribute) {
                    var anchor = document.createElement('a');
                    anchor.href = 'data:attachment/text;base64,' + encodeURI(window.btoa(content));
                    anchor.target = '_blank';
                    anchor.download = name;
                    //Dispatching click event.
                    if (document.createEvent) {
                        var event = document.createEvent('MouseEvents');
                        event.initEvent('click', true, true);
                        anchor.dispatchEvent(event);
                        return true;
                    }
                } else if (window.Blob !== undefined && window.saveAs !== undefined) {
                    var blob = new Blob([content], { type: type });
                    saveAs(blob, filename);
                } else {
                    window.open('data:attachment/text;charset=utf-8,' + encodeURI(content));
                }
            }
            /*
            var headers = response.headers();
            // console.log(response);
            var blob = new Blob([response.data], { type: "application/octet-stream" }); // { type: headers['content-type'] });
            var windowUrl = (window.URL || window.webkitURL);
            var downloadUrl = windowUrl.createObjectURL(blob);
            var anchor = document.createElement("a");
            anchor.href = downloadUrl;
            var fileNamePattern = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            anchor.download = fileNamePattern.exec(headers['content-disposition'])[1];
            document.body.appendChild(anchor);
            anchor.click();
            windowUrl.revokeObjectURL(blob);
            anchor.remove();
            */
            /*
            //Dispatching click event.
            if (document.createEvent) {
                var e = document.createEvent('MouseEvents');
                e.initEvent('click', true, true);
                link.dispatchEvent(e);
                return true;
            }
            */
        }

        function serverDownload(options) {
            var defaults = {
                uri: '/api/reports/download',
                name: 'Filename',
                extension: 'txt',
                type: 'text/plain',
                content: 'Hello!',
            };
            options = angular.extend(defaults, options);
            var content = JSON.stringify(options); // unescape(encodeURIComponent(JSON.stringify(download)));
            var form = document.createElement('form');
            var input = document.createElement('input');
            input.name = 'download';
            input.value = content;
            form.appendChild(input);
            form.action = options.uri;
            form.method = 'POST';
            form.target = 'ProjectDownloads';
            form.enctype = 'application/x-www-form-urlencoded';
            // form.enctype = 'multipart/form-data';
            // form.enctype = 'text/plain';
            document.body.appendChild(form);
            form.submit();
            setTimeout(function() {
                document.body.removeChild(form);
            }, 100);
            // angular.element(form).find('button')[0].click();
            return Utils;
        }
    }]);

}());