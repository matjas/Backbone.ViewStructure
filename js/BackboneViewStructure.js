/**
 * Extended Backbone View with abstract view functionality
 * @module ViewStructurePlug
 * @requires Backbone
 * @version 1.0.0
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['backbone', 'underscore', 'jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('backbone'), require('underscore'), require('jquery'));
    } else {
        root.Backbone.ViewStructurePlugin = factory(root.Backbone, root._, root.jQuery);
    }
}(this, function (Backbone, _, jQuery) {
    'use strict';

    var destroyView = function (view) {
        if (view.destroy) {
            view.destroy();
            return;
        }

        view.remove();

        view.stopListening();

        view._isAttached = false;

        view._isDestroyed = true;

    };

    // Define a re-usable "Region" object
    var Region = (function (Backbone, $)  {
        // Define the Region constructor function
        // accept an object parameter with an `el`
        // to define the element to manage
        function R(options){
            this.el = options.el;
            this.currentView = undefined;
        }
        // extend the Region with the correct methods
        _.extend(R.prototype, {
            _isDestroyed: false,

            isDestroyed: function() {
                return this._isDestroyed;
            },
            // A method to close the current view
            closeView: function (view) {
                view && destroyView(view);
                // if (view && view.remove) {
                //     view.remove();
                // }
            },
            // A method to render and show a new view
            openView: function (view) {
                this.ensureEl();
                view.render();
                this.$el.html(view.el);
            },

            // ensure the element is available th
            // first time it is used. cache it after th t”
            ensureEl: function(){
                if (this.$el){ return; }
                this.$el = $(this.el);
            },
            // show a view and close an existing view,
            // if one is already in this DOM element
            show: function (view) {
                this.closeView(this.currentView);
                this.currentView = view;
                this.openView(view);
                // run the onShow method if it is found
                if (_.isFunction(view.onShow)) {
                    view.onShow();
                }
            },
            destroy: function(){
                if (this._isDestroyed) { return this; }

                this._isDestroyed = true;
                this.stopListening();

                return this;
            }
        });
        // export the Region type so it can be used
        return R;
    })(Backbone, jQuery);

    //Mixins
    var Mixins = {};

    //ViewMixin
    Mixins.View = {
        _isRendered: false,

        isRendered() {
            return !!this._isRendered;
        },
        _isDestroyed: false,

        isDestroyed () {
            return !!this._isDestroyed;
        },
        // Handle destroying the view and its children.
        destroy: function() {
            if (this._isDestroyed) { return this; }
            //const shouldTriggerDetach = this._isAttached && !this._shouldDisableEvents;

            // this.triggerMethod('before:destroy', this, arguments);
            // if (shouldTriggerDetach) {
            //     this.triggerMethod('before:detach', this);
            // }

            // unbind UI elements
            //this.unbindUIElements();

            // remove the view from the DOM
            this._removeElement();

            // if (shouldTriggerDetach) {
            //     this._isAttached = false;
            //     this.triggerMethod('detach', this);
            // }

            // remove children after the remove to prevent extra paints
            this._removeChildren();

            this._isDestroyed = true;
            this._isRendered = false;

            // Destroy behaviors after _isDestroyed flag
            //this._destroyBehaviors(...args);

            //this.trigger('destroy', this, arguments);

            this.stopListening();

            return this;
        },
        _removeElement(){
            this.$el.off();
            this.$el.remove();
            //this.Dom.detachEl(this.el, this.$el);
        }
    };

    //RegionsMixin
    Mixins.Regions = {

    };

    /**
     * @typedef {jQuery|Zepto} $
     * @see {@link Backbone.$}
     */

    /**
     * @alias module:ViewStructurePlugin
     * @class ViewStructurePlugin
     */

    var ViewStructurePlugin = {};

    /**
     * @alias module:ViewStructurePlugs
     * @class BaseView
     * @extends Backbone.View
     */
    ViewStructurePlugin.BaseView = Backbone.View.extend(/**@lends Backbone.View#*/{

        //default template
        template: "<div></div>",

        constructor: function(options){
            Backbone.View.prototype.constructor.apply(this, arguments);
            this.buildTemplateCache();
        },

        buildTemplateCache: function(){
            var proto = Object.getPrototypeOf(this);

            if (proto.templateCache || !this.template) { return; }
            proto.templateCache = _.isFunction(this.template) ? this.template : _.template(this.template);
        },

        render: function(){
            var data;
            if (this.serializeData){
                data = this.serializeData();
            }
            // use the pre-compiled, cached template function
            var renderedHtml = this.templateCache(data);
            this.$el.html(renderedHtml);

            // Call the `onRender` method if it exists
            if (this.onRender){
                this.onRender();
            }

            return this;
        },
        // called by ViewMixin destroy
        _removeChildren: function() {
            this.closeRegions && this.closeRegions();
        }
    });

    _.extend(ViewStructurePlugin.BaseView.prototype, Mixins.View, Mixins.Regions);

    /**
     * @alias module:ViewStructurePlugin
     * @class CollectionView
     * @extends ViewStructurePlugin.BaseView
     */
    ViewStructurePlugin.CollectionView = ViewStructurePlugin.BaseView.extend(/**@lends ViewStructurePlugin.BaseView#*/{
        serializeData: function(){
            var data;

            if (this.collection){
                data = {items: this.collection.toJSON()};
            }

            return data;
        }
    });

    /**
     * @alias module:ViewStructurePlugin
     * @class CollectionModelView
     * @extends ViewStructurePlugin.BaseView
     */
    ViewStructurePlugin.CollectionModelView = ViewStructurePlugin.BaseView.extend(/**@lends ViewStructurePlugin.BaseView#*/{

        constructor: function(options){
            ViewStructurePlugin.BaseView.call(this, options);

            // set up storage for views
            this.children = {};

            this.listenTo(this.collection, "add", this.modelAdded);
            this.listenTo(this.collection, "remove", this.modelRemoved);
            this.listenTo(this.collection, "reset", this.render);
        },

        // a method to get the type of view for
        // each model. this method can be overridden
        // to return a different view type based on
        // attributes of the model passed in
        getModelView: function(model){
            return this.modelView;
        },
        // event handler for model added to collection
        modelAdded: function(model){
            var view = this.renderModel(model);
            var collectionIdx = this.collection.indexOf(model);
            var childEl;

            if (collectionIdx <= 0) {
                this.$el.prepend(view.$el);
            } else {
                childEl = this.getNthChildView(collectionIdx);
                childEl ? view.$el.insertAfter(childEl) : this.$el.append(view.$el);
            }
            this.trigger('modelAdded', view);
        },

        // handle removing an individual model
        modelRemoved: function(model){
            // guard clause to make sure we have a model
            if (!model){ return; }

            // guard clause to make sure we have a view
            var view = this.children[model.cid];
            if (!view){ return; }

            this.closeChildView(view);
            this.trigger('modelRemoved', view);
        },

        // get child view by model
        getChildViewByModel: function(model){
            return this.children[model.cid];
        },

        // get child view by index
        getNthChildView: function (idx) {
            var childEl = this.$el.find("> :nth-child(" + idx + ")");
            return childEl.length > 0 ? childEl[0] : undefined;
        },

        //find by Index.
        findByIndex: function (index) {
            var val = _.values(this.children);
            return _.values(this.children)[index];
        },
        //get last child view
        getLastChildView: function () {
            var view = this.$el.find("> :last-child");
            return view.length > 0 ? view[0] : undefined;
        },

        // a method to close an individual view
        closeChildView: function(view){
            if (!view){ return; }

            // remove the view, if the method is there
            // if (_.isFunction(view.remove)){
            //     view.remove();
            // }
            destroyView(view);

            // remove it from the children
            delete this.children[view.model.cid];
        },

        // close and remove all children
        closeChildren: function(){
            var children = this.children || {};
            _.each(children, function(child){
                this.closeChildView(child);
            }, this);
        },

        // render a single model
        renderModel: function(model){
            var ViewType = this.getModelView(model);
            var view = new ViewType({model: model});

            // store the child view for this model
            this.children[model.cid] = view;

            view.render();
            return view;
        },

        // render the entire collection
        render: function(){
            var html = [];

            this.closeChildren();

            // render a model view for each model
            // and push the results
            this.collection.each(function(model){
                var view = this.renderModel(model);
                html.push(view.$el);
            }, this);
            // populate the collection view
            // with the rendered results
            this.$el.html(html);

            this.trigger('render');

            return this;
        },
        // override remove and have it
        // close all the children
        remove: function(){
            ViewStructurePlugin.BaseView.prototype.remove.call(this);
            this.closeChildren();
        }

    });

    /**
     * @alias module:ViewStructurePlugin
     * @class ModelView
     * @extends ViewStructurePlugin.BaseView
     */
    ViewStructurePlugin.ModelView = ViewStructurePlugin.BaseView.extend(/**@lends ViewStructurePlugin.BaseView#*/{

        serializeData: function(){
            var data;

            if (this.model){
                data = this.model.toJSON();
            }

            return data;
        }
        // _prepareModel: function () {
        //     if (!this.model instanceof Backbone.Model && _.isObject(this.model)) {
        //         this.model = new Backbone.Model(this.model);
        //     }
        // }

    });

    /**
     * @alias module:ViewStructurePlugin
     * @class Layout
     * @extends ViewStructurePlugin.ModelView
     */
    ViewStructurePlugin.Layout = ViewStructurePlugin.ModelView.extend(/**@lends ViewStructurePlugin.ModelView#*/{

        render: function(){
            // close the old regions, if any exist
            this.closeRegions();

            // call the original
            var result = ViewStructurePlugin.ModelView.prototype.render.call(this);

            // call to process the regions
            this.configureRegions();

            return result;
        },

        configureRegions: function(){
            // get the definitions
            var regionDefinitions = this.regions || {};

            // loop through them
            _.each(regionDefinitions, function(selector, name){

                // pre-select the DOM element
                var el = this.$(selector);

                // create the region, assign to the layout
                this[name] = new Region({el: el});

                // save parent view
                this[name][_parentView] = this;
            }, this);

            // Call the `onRegions` method if it exists
            if (this.onRegionsConf){
                this.onRegionsConf();
            }
        },

        close: function(){
            // close the Layout before close regions. Avoid reflow.
            ViewStructurePlugin.Layout.prototype.close.call(this);
            // close the regions
            this.closeRegions();
        },
        closeRegions: function(){
            _.each(this.regions, function(selector, name){
                // grab the region by name, and close it
                var region = this[name];
                if (region && region.currentView && _.isFunction(region.currentView.destroy)){
                    region.currentView.destroy();
                }
            }, this);
        }
    });

    return ViewStructurePlugin;
}));
