//HEAD 
(function(app) {
try { app = angular.module("framework"); }
catch(err) { app = angular.module("framework", []); }
app.run(["$templateCache", function($templateCache) {
"use strict";

$templateCache.put("partials/framework/forms/checkbox","<input type=\"hidden\" name=\"{{field}}\" ng-model=\"ngModel\" ng-required=\"required\" />\n" +
    "<div class=\"form-check form-group form-group-{{type}}\" ng-class=\"getClasses()\">\n" +
    "    <label for=\"{{field}}\" class=\"form-label\">\n" +
    "        <span ng-bind-html=\"placeholder\"></span><sup ng-if=\"required\">✽</sup>\n" +
    "    </label>\n" +
    "    <control-messages></control-messages>\n" +
    "    <div class=\"input-group\" ng-repeat=\"item in source\">\n" +
    "        <label class=\"form-check-label\">\n" +
    "            <input type=\"radio\" class=\"form-check-input\" ng-model=\"$parent.ngModel\" name=\"input-{{field}}\" ng-value=\"item.id\" />\n" +
    "            {{item.name}}\n" +
    "        </label>\n" +
    "    </div>\n" +
    "</div>")

$templateCache.put("partials/framework/forms/file","<div class=\"form-group form-group-{{type}}\" ng-class=\"getClasses()\">\n" +
    "    <label for=\"{{field}}\" class=\"form-label\">\n" +
    "        <span ng-bind=\"title\"></span><sup ng-if=\"required\">✽</sup>\n" +
    "        <span ng-bind=\"ngModel.name\"></span>\n" +
    "    </label>\n" +
    "    <input type=\"{{getType()}}\" name=\"{{field}}\" class=\"form-control\" file-model=\"ngModel\" ng-model=\"ngModel\" validate=\"file\" ng-model-options=\"options\" placeholder=\"{{placeholder}}\" ng-required=\"required\" on-busy=\"onBusy()\" on-complete=\"onComplete()\" accept=\"{{accept}}\"\n" +
    "        maxsize=\"{{maxsize}}\" ng-focus=\"focus = true\" ng-blur=\"focus = false\">\n" +
    "    <control-messages></control-messages>\n" +
    "</div>")

$templateCache.put("partials/framework/forms/messages","<span ng-messages=\"getMessages()\" role=\"alert\">\n" +
    "<span ng-message=\"required\" class=\"label-error animated flash\">obbligatorio</span>\n" +
    "<span ng-message=\"minlength\" class=\"label-error animated flash\" ng-if=\"type == 'password'\">almeno 6 caratteri</span>\n" +
    "<span ng-message=\"email\" class=\"label-error animated flash\" ng-if=\"type == 'email'\">valore non corretto</span>\n" +
    "<span ng-message=\"date\" class=\"label-error animated flash\" ng-if=\"type == 'date'\">formato non corretto</span>\n" +
    "<span ng-message=\"min\" class=\"label-error animated flash\" ng-if=\"type == 'date'\">intervallo non corretto</span>\n" +
    "<span ng-message=\"max\" class=\"label-error animated flash\" ng-if=\"type == 'date'\">intervallo non corretto</span>\n" +
    "<span ng-message=\"maxsize\" class=\"label-error animated flash\" ng-if=\"type == 'file'\">dimensione massima superata</span>\n" +
    "<span ng-message=\"accept\" class=\"label-error animated flash\" ng-if=\"type == 'file'\">estensione non consentita</span>\n" +
    "<span ng-message=\"positive\" class=\"label-error animated flash\" ng-if=\"validate == 'number' || validate == 'range'\">solo valori positivi</span>\n" +
    "<span ng-message=\"number\" class=\"label-error animated flash\" ng-if=\"validate == 'number' || validate == 'range'\">solo valori numerici</span>\n" +
    "<span ng-message=\"match\" class=\"label-error animated flash\" ng-if=\"match\">non corrispondente</span>\n" +
    "</span>")

$templateCache.put("partials/framework/forms/radio","<input type=\"hidden\" name=\"{{field}}\" ng-model=\"ngModel\" ng-required=\"required\" />\n" +
    "<div class=\"form-check form-group form-group-{{type}}\" ng-class=\"getClasses()\">\n" +
    "    <label for=\"{{field}}\" class=\"form-label\">\n" +
    "        <span ng-bind-html=\"placeholder\"></span><sup ng-if=\"required\">✽</sup>\n" +
    "    </label>\n" +
    "    <control-messages></control-messages>\n" +
    "    <div class=\"input-group\" ng-repeat=\"item in source\">\n" +
    "        <label class=\"form-check-label\">\n" +
    "            <input type=\"radio\" class=\"form-check-input\" ng-model=\"$parent.ngModel\" name=\"input-{{field}}\" ng-value=\"item.id\" />\n" +
    "            {{item.name}}\n" +
    "        </label>\n" +
    "    </div>\n" +
    "</div>")

$templateCache.put("partials/framework/forms/select","<div class=\"form-group form-group-{{type}}\" ng-class=\"getClasses()\">\n" +
    "    <label for=\"{{field}}\" class=\"form-label\">\n" +
    "        <span ng-bind=\"title\"></span><sup ng-if=\"required\">✽</sup>\n" +
    "    </label>\n" +
    "    <select name=\"{{field}}\" class=\"form-control\" ng-model=\"ngModel\" ng-options=\"{{getOptions()}}\" ng-required=\"required\" ng-disabled=\"disabled\" ng-readonly=\"readonly\" ng-change=\"onChange()\" ng-focus=\"focus = true\" ng-blur=\"focus = false\">\n" +
    "        <option value=\"\" disabled selected hidden>{{placeholder}}</option>\n" +
    "    </select>\n" +
    "    <control-messages></control-messages>\n" +
    "</div>")

$templateCache.put("partials/framework/forms/text","<div class=\"form-group form-group-{{type}}\" ng-class=\"getClasses()\">\n" +
    "    <label for=\"{{field}}\" class=\"form-label\" ng-if=\"title != 'untitled'\">\n" +
    "        <span ng-bind=\"title\"></span><sup ng-if=\"required\">✽</sup>\n" +
    "    </label>\n" +
    "    <div class=\"input-group\">\n" +
    "        <input type=\"{{getType()}}\" name=\"{{field}}\" class=\"{{class || 'form-control'}}\" ng-model=\"ngModel\" ng-model-options=\"options\" placeholder=\"{{placeholder}}\" ng-minlength=\"minLength\" ng-maxlength=\"maxLength\" min=\"{{min}}\" max=\"{{max}}\" ng-required=\"required\"\n" +
    "            ng-disabled=\"disabled\" ng-readonly=\"readonly\" ng-change=\"onChange\" ng-focus=\"focus = true\" ng-blur=\"focus = false\">\n" +
    "        <span class=\"input-group-addon\" ng-if=\"type == 'password' && ngModel\">\n" +
    "            <span class=\"icon-eye\" ng-click=\"toggleVisibility()\"></span>\n" +
    "        </span>\n" +
    "    </div>\n" +
    "    <control-messages></control-messages>\n" +
    "</div>")
}]);
})();