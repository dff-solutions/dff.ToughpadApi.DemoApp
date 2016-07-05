    angular
        .module('dff.dom', [])
        .factory('dffDomMutationObserverService', function () {
            return new dff.dom.MutationObserverService();
        })
        .directive('dffDomMutationObserver', function (dffDomMutationObserverService) {
            function link(scope, element, attrs) {
                var options = attrs.dffDomMutationObserver.split(",");

                var config = {
                    childList: false,
                    attributes: false,
                    characterData: false,
                    subtree: false,
                    attributeOldValue: false,
                    characterDataOldValue: false
                };

                if (options.indexOf("childList") >= 0) {
                    config.childList = true;
                }

                if (options.indexOf("attributes") >= 0) {
                    config.attributes = true;
                }

                if (options.indexOf("characterData") >= 0) {
                    config.characterData = true;
                }

                if (options.indexOf("subtree") >= 0) {
                    config.subtree = true;
                }

                if (options.indexOf("attributeOldValue") >= 0) {
                    config.attributeOldValue = true;
                }

                if (options.indexOf("characterDataOldValue") >= 0) {
                    config.characterDataOldValue = true;
                }

                dffDomMutationObserverService.observe(element[0], config);
            }

            return {
                priority: 9999,
                link: link
            };
        });