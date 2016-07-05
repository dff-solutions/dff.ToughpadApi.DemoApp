    /**
     * @namespace dff/dom
     */
    dff.namespace('dff.dom');

    /**
     * Observes given dom element for specfied mutations.
     * For each mutation that is observed the registered observers are notified.
     *
     * @name MutationObserverService
     * @memberOf dff/dom
     * @constructor
     *
     */
    dff.define('dff.dom.MutationObserverService', function () {
        this.observers = [];
    });

    /**
     * Adds an observer that gets notified on mutations.
     *
     * @name addObserver
     * @memberOf dff/dom.MutationObserverService
     * @instance
     *
     * @param {object} observer A observer to notify on mutations.
     */
    dff.dom.MutationObserverService.prototype.addObserver = function (observer) {
        // don't add observer twice
        if (this.observers.indexOf(observer) < 0) {
            this.observers.push(observer);
        }
    };

    /**
     * Removes all observers.
     *
     * @name clearObservers
     * @memberOf dff/dom.MutationObserverService
     * @instance
     */
    dff.dom.MutationObserverService.prototype.clearObservers = function () {
        this.observers = [];
    };

    /**
     * Listens to mutations and notifies all observers which listen to the mutations type.
     *
     * @name onMutation
     * @memberOf dff/dom.MutationObserverService
     * @instance
     *
     * @param {object} mutation A mutation observed and observers should be notified about.
     */
    dff.dom.MutationObserverService.prototype.onMutation = function(mutation) {
        this.observers.forEach(function (observer) {
            if (observer.types.indexOf(mutation.type) >= 0) {
                observer.onMutation(mutation);
            }
        });
    };

    /**
     * Observes a DOM element on specified mutations.
     *
     * @name observe
     * @memberOf dff/dom.MutationObserverService
     * @instance
     *
     * @param {object} element DOM element to observe.
     * @param {object} config Options that define which kind of mutation should be observed.
     * @param {boolean} config.childList               Set to true if child elements should be observed.
     * @param {boolean} config.attributes              Set to true if element attributes should be observed.
     * @param {boolean} config.characterData           Set to true if element data should be observed.
     * @param {boolean} config.subtree                 Set to true if changes below child notes should also be observed.
     * @param {boolean} config.attributeOldValue       Set to true if old value of attributes should be observed.
     * @param {boolean} config.characterDataOldValue   Set to true if old data values should be observed.
     */
    dff.dom.MutationObserverService.prototype.observe = function (element, config) {
        var self = this;

        var observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                self.onMutation(mutation);
            });
        });

        observer.observe(element, config);
    };
