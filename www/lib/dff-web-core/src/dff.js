
    /**
     * The <b>dff</b> object provides a global namespace to build the
     * library structure of dff web applications.
     * You have to use {@link dff#define} to create a sub namespace and its
     * component functionality.
     *
     * @namespace dff
     * @package dff-web-core
     */
    var dff = window.dff = {};

    /**
     * Creates the given namespace within <b>dff</b> namespace.
     * The method returns a namespace object. Simply pass a string that
     * represents a namespace using dot notation. E.g. <b><code>foo.bar.murx</code></b>.
     * All namespaces are created under <b>dff</b> namespace. If <b>dff</b> is given as root namespace
     * it gets stripped out.
     *
     * @name namespace
     * @memberOf dff
     * @function
     * @instance
     *
     * @param {string} namespace A string that represents a new namespace e.g. <b><code>foo.bar.murx<code></b>.
     * @returns {object} A namespace object containing information about the current and parent
     * targets with the structure:
     * <ul>
     *     <li>targetParent - Parent namespace object</li>
     *     <li>targetName - Current namespace name.</li>
     *     <li>bind - A function to bind a value to the namespace.</li>
     * </ul>
     */
    dff.namespace = function (namespaceString) {
        var parts = namespaceString.split('.');
        var parent = dff;
        var i;

        // strip redundant leading global
        if (parts[0] === 'dff') {
            parts = parts.slice(1);
        }

        var targetParent = dff;
        var targetName;

        for (i = 0; i < parts.length; i++) {
            // create a property if it doesn't exist
            if (typeof parent[parts[i]] === 'undefined') {
                parent[parts[i]] = {};
            }

            if (i === parts.length - 2) {
                targetParent = parent[parts[i]];
            }

            targetName = parts[i];
            parent = parent[parts[i]];
        }

        return {
            targetParent: targetParent,
            targetName: targetName,
            bind: function (target) {
                targetParent[targetName] = target;
            }
        };
    };

    /**
     * The <b><code>define</code></b> method delegates to {@link dff#namespace} and binds a new value to its given namespace.
     * Namespace rules are the same as for {@link dff#namespace}.
     * A second argument has to be a constructor function that will be bound to the given namespace.
     *
     * This method is generally used to definde new components in the <b>dff</b> namespace.
     *
     * @name define
     * @memberOf dff
     * @function
     * @instance
     *
     */
    dff.define = function (namespace, fn) {
        dff.namespace(namespace).bind(fn);
    };
