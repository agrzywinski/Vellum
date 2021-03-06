// plugin pattern adapted from JSTree, minus plugin events

define([
    'jquery',
    'underscore'
], function (
    $,
    _,
    undefined
) {
    // The order of plugins in this list is important: it controls the order in
    // which plugin methods are called. Core is at the center, each plugin is a
    // layer on top of the next. A method call starts at the last plugin in the
    // list that defines the method and continues toward the core (assuming each
    // plugin method calls `this.__callOld()`)
    var corePlugins = [
            'core',
            'intents',
            'javaRosa',
            'lock',
            'ignore',
            'uploader',
            'windowManager'
        ],
        instances = [];

    function bindPluginMethod(pluginName, fn, fnName) {
        // this is not how jstree does it, and a bit hacky, but it makes
        // defining plugins simpler
        if (fnName === 'init' && pluginName !== 'core') {
            return;
        }

        // call private methods normally
        if (fnName.indexOf('_') === 0) {
            if (this[fnName] !== undefined) {
                throw ("private plugin method " + pluginName + "." + fnName +
                       " would overwrite existing: " + this[fnName]);
            }
            // this could be a problem if two plugins have a private
            // method with the same name, easily fixed
            this[fnName] = fn;
            return;
        }

        fn.plugin = pluginName;
        fn.old = this[fnName];
        this[fnName] = function () {
            var func = fn,
                args = Array.prototype.slice.call(arguments);

            // call function with a __callOld() method added to
            // `this` that calls the next copy of this method in the
            // plugin stack
            return func.apply(
                $.extend({}, this, {
                    __callOld: function () {
                        return func.old.apply(this, (arguments.length ?
                            Array.prototype.slice.call(arguments) : args));
                    }
                }), 
                args);
        };
        this[fnName].old = fn.old;
        this[fnName].plugin = pluginName;
    }

    $.fn.vellum = function (options) {
        var isMethodCall = typeof options === 'string',
            args = Array.prototype.slice.call(arguments, 1),
            retVal;

        if (isMethodCall) {
            this.each(function () {
                var instanceId = $.data(this, "vellum_instance_id"),
                    instance = instances[instanceId];
                retVal = instance[options].apply(instance, args);
            });
            return retVal;
        } else {
            // Instantiate an instance for each element in the jquery object set
            // passed.  In practice, it's unlikely that you'd ever want to
            // instantiate multiple instances at once.
            this.each(function () {
                var instanceId = $.data(this, "vellum_instance_id");
                if (instanceId === undefined) {
                    instances.push({});
                    instanceId = instances.length - 1;
                }
                $.data(this, "vellum_instance_id", instanceId);
                instances[instanceId] = new $.vellum._instance($(this), options);
            });
            return this;
        }
    };

    $.vellum = {
        defaults: {},
        _plugins: {},
        _fn: {},
        _instance: function ($f, options) {
            options.plugins = _.uniq(corePlugins.concat(options.plugins || []));
            options = $.extend(true, {}, $.vellum.defaults, options);

            var instance = this;
            this.$f = $f;
            this.data = {};
            this.opts = function () { 
                return $.extend(true, {}, options);
            };

            this.getData = function () {
                return this.data;
            }.bind(this);

            this.isPluginEnabled = function (name) {
                return options.plugins.indexOf(name) !== -1;
            };

            _.each(options.plugins, function (pluginName, i) {
                instance.data[pluginName] = {};
                var fns = $.vellum._plugins[pluginName];
                if (fns) {
                    _.each(fns, function (fn, fnName) {
                        if (i === 0) {
                            // bind root plugin (usually "core") methods
                            // directly to instance to make debugging easier
                            // and method calls have less overhead.
                            instance[fnName] = fn;
                        } else {
                            bindPluginMethod.call(instance, pluginName, fn, fnName);
                        }
                    });
                }
            });

            _.each(options.plugins, function (p) {
                var initFn = $.vellum._plugins[p].init;
                if (initFn) {
                    initFn.apply(instance);
                }
            });

            // do final initialization that requires all plugins to be loaded
            instance.postInit();
        },
        plugin: function (pluginName, defaults, fns) {
            $.vellum.defaults[pluginName] = defaults;
            $.vellum._plugins[pluginName] = fns;
            return $;
        }
    };

    return;
});
