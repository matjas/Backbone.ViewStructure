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

        view._isDestroyed = true;
        view._isRendered = false;

    };

    // Define a re-usable "Region" object
    var Region = (function (Backbone, $) {
        // Define the Region constructor function
        // accept an object parameter with an `el`
        // to define the element to manage
        function R(options) {
            this.el = options.el;
            this.currentView = undefined;
        }

        // extend the Region with the correct methods
        _.extend(R.prototype, {
            _isDestroyed: false,

            isDestroyed: function () {
                return this._isDestroyed;
            },
            _empty(view) {
                view.off('destroy');

                delete this.currentView;

                if (!view._isDestroyed) {
                    this._detachView();
                }
            },
            _detachView() {
                this.detachContents(this.el, this.$el);
            },
            detachContents(el, _$el) {
                //TODO: Create DOM library
                _$el.contents().detach();
            },
            // Empties the Region without destroying the view
            closeView: function () {
                var view = this.currentView;

                if (!view) {
                    return;
                }

                this._empty(view);

                return view;
            },
            _getView(view) {

                if (view._isDestroyed) {
                    console.log("View has been already destroyed. Can not be used")
                }

                if (view instanceof Backbone.View) {
                    return view;
                }

                return new ViewStructurePlugin.ModelView();
            },
            // A method to render and show a new view
            openView: function (view) {
                //var view = this.currentView;
                if (!this.ensureEl()) {
                    return;
                }

                view = this._getView(view);

                if (view === this.currentView) { return this; }

                this.currentView = view;

                view.render();

                this.$el.html(view.el);

                return this;
            },

            // ensure the element is available th
            // first time it is used. cache it after th t”
            ensureEl: function () {
                if (this.$el) {
                    return true;
                }
                this.$el = $(this.el);
                if(!this.$el || this.$el.length === 0) {
                    return false
                }
                return true;
            },
            // show a view and close an existing view,
            // if one is already in this DOM element
            show: function (view) {
                this.closeView(this.currentView);
                this.openView(view);
                this._isDestroyed = false;
                view.on("destroy", this.closeView, this);
                // run the onShow method if it is found
                if (_.isFunction(view.onShow)) {
                    view.onShow();
                }
            },
            destroyView: function (view) {
                if (!view) return;
                view.off("destroy");
                if (view._isDestroyed) {
                    return view;
                }
                destroyView(view);

                delete this.currentView;
            },
            reset: function () {
                delete this.$el;
                return this;
            },
            destroy: function () {
                if (this._isDestroyed) {
                    return this;
                }

                this.reset();
                this.destroyView(this.currentView);
                //
                // if (this._name) {
                //     this._parentView._removeReferences(this._name);
                // }
                delete this._parentView;
                delete this._name;

                this._isDestroyed = true;

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
        destroy: function () {
            if (this._isDestroyed) {
                return this;
            }
            // Call the `onBeforeDestroy` method if it exists
            if (this.onBeforeDestroy) {
                this.onBeforeDestroy(this);
            }
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

            if (this.onDestroy) {
                this.onDestroy(this);
            }

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
    Mixins.Regions = {};

    //AnimationMixin
    Mixins.Animation = {
        breakAnimation: {
            _stopAnimation: function () {
                var className = this.className || this.$el.attr('class'),
                    classArray;

                if (className && className.length) {
                    classArray = className.split(' ');
                    classArray = classArray.filter(function(e) {
                        return e.length > 0;
                    });
                    if (classArray.length) {
                        className = classArray[0];
                        this.$el.addClass(className + '_noanim')[0].offsetHeight;
                        this.$el.removeClass(className + '_noanim');
                    }
                }
            }
        }
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

        constructor: function (options) {
            Backbone.View.prototype.constructor.apply(this, arguments);
            this.buildTemplateCache();
        },

        buildTemplateCache: function () {
            var proto = Object.getPrototypeOf(this);

            if (proto.templateCache || !this.template) {
                return;
            }
            proto.templateCache = _.isFunction(this.template) ? this.template : _.template(this.template);
        },

        render: function () {
            var data;
            if (this.serializeData) {
                data = this.serializeData();
            }
            // use the pre-compiled, cached template function
            var renderedHtml = this.templateCache(data);
            this.$el.html(renderedHtml);
            this._isRendered = true;

            // Call the `onRender` method if it exists
            if (this.onRender) {
                this.onRender();
            }

            return this;
        },
        // called by ViewMixin destroy
        _removeChildren: function () {
            this.removeRegions && this.removeRegions();
        }
    });

    _.extend(ViewStructurePlugin.BaseView.prototype, Mixins.View, Mixins.Regions);

    /**
     * @alias module:ViewStructurePlugin
     * @class CollectionView
     * @extends ViewStructurePlugin.BaseView
     */
    ViewStructurePlugin.CollectionView = ViewStructurePlugin.BaseView.extend(/**@lends ViewStructurePlugin.BaseView#*/{
        serializeData: function () {
            var data;

            if (this.collection) {
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

        constructor: function (options) {
            ViewStructurePlugin.BaseView.call(this, options);

            // set up storage for views
            this.children = {};

            this.listenTo(this.collection, "add", this.modelAdded);
            this.listenTo(this.collection, "remove", this.modelRemoved);
            this.listenTo(this.collection, "reset", this.render);

            if(this.onInitialization){
                this.onInitialization();
            }
        },

        // a method to get the type of view for
        // each model. this method can be overridden
        // to return a different view type based on
        // attributes of the model passed in
        getModelView: function (model) {
            return this.modelView;
        },
        // event handler for model added to collection
        modelAdded: function (model) {
            var collectionIdx = this.collection.indexOf(model);

            var view = this._renderModel(model, collectionIdx);
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
        modelRemoved: function (model) {
            // guard clause to make sure we have a model
            if (!model) {
                return;
            }

            // guard clause to make sure we have a view
            var child = this.children[model.cid];
            if (!child) {
                return;
            }

            this.closeChildView(child);
            this._updateIndex();
            this.trigger('modelRemoved', child._view);
        },

        // get child view by model
        getChildViewByModel: function (model) {
            var child = this.children[model.cid];
            return child && child._view;
        },

        // get child view by index
        getNthChildView: function (idx) {
            var childEl = this.$el.find("> :nth-child(" + idx + ")");
            return childEl.length > 0 ? childEl[0] : undefined;
        },

        //find by Index.
        findByIndex: function (index) {
            if (this.collection.length > 0) {
                var model = this.collection.at(index);
                var child = model && this.children[model.cid];
                return child && child._view;
            }
            //return _.values(this.children)[index];
        },
        // Internal method. This decrements or increments the indices of views after the added/removed
        // view to keep in sync with the collection.
        // _updateIndices(views, increment) {
        //     // if (!this.sort) {
        //     //     return;
        //     // }
        //
        //     if (!increment) {
        //         _.each(_.sortBy(this.children._views, '_index'), function (view, index) {
        //             view._index = index;
        //         });
        //         return;
        //     }
        //
        //     var view = _.isArray(views) ? _.max(views, '_index') : views;
        //
        //     if (_.isObject(view)) {
        //         // update the indexes of views after this one
        //         _.each(this.children._views, function (laterView){
        //             if (laterView._index >= view._index) {
        //                 laterView._index += 1;
        //             }
        //         });
        //     }
        // },
        //get last child view
        getLastChildView: function () {
            var view = this.$el.find("> :last-child");
            return view.length > 0 ? view[0] : undefined;
        },

        // a method to close an individual view
        closeChildView: function (child) {
            if (!child) {
                return;
            }

            // remove the view, if the method is there
            // if (_.isFunction(view.remove)){
            //     view.remove();
            // }
            destroyView(child._view);

            // remove it from the children
            delete this.children[child._view.model.cid];
        },

        // close and remove all children
        closeChildren: function () {
            var children = this.children || {};
            _.each(children, function (child) {
                this.closeChildView(child);
            }, this);
        },

        // render a single model
        _renderModel: function (model, index) {
            var ViewType = this.getModelView(model);
            var view = new ViewType({model: model});

            // store the child view for this model
            this.children[model.cid] = this._createChild(view, index);

            this._updateIndex();

            view.render();
            return view;
        },
        //Add child into children object
        _createChild: function (view, index) {
            return {
                _view: view,
                _indexByModel: index
            }
        },
        //Update index
        _updateIndex: function () {
            this.collection.each(function(model, index){
                var child = this.children[model.cid];
                child && (child._indexByModel = index);
            }, this);
        },
        _renderChildren: function (){
            if (this._isRendered) {
                this.closeChildren();
            }
            var html = [];

            // render a model view for each model
            // and push the results
            this.collection.each(function (model, index) {
                var view = this._renderModel(model, index);
                html.push(view.$el);
            }, this);
            // populate the collection view
            // with the rendered results
            this.$el.html(html);
        },
        // render the entire collection
        render: function () {
            if (this._isDestroyed) {return this;}
            // Call the `onBeforeRender` method if it exists
            if (this.onBeforeRender) {
                this.onBeforeRender();
            }
            this._renderChildren();
            this._isRendered = true;

            if (this.onRender) {
                this.onRender();
            }

            this.trigger('render');

            return this;
        },
        // override remove and have it
        // close all the children
        remove: function () {
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

        serializeData: function () {
            var data;

            if (this.model) {
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

        render: function () {
            // close the old regions, if any exist
            this.removeRegions();

            // call the original
            var result = ViewStructurePlugin.ModelView.prototype.render.call(this);

            // call to process the regions
            this._configureRegions();

            return result;
        },

        _configureRegions: function () {
            this.regions = this.regions || {};
            this._regions = {};

            this.addRegions(_.result(this, 'regions'));


            // get the definitions
            // var regionDefinitions = this.regions || {};
            //
            // // loop through them
            // _.each(regionDefinitions, function(selector, name){
            //
            //     // pre-select the DOM element
            //     var el = this.$(selector);
            //
            //     // create the region, assign to the layout
            //     this[name] = new Region({el: el});
            //
            //     // save parent view
            //     //this[name][_parentView] = this;
            // }, this);
            //

            // Call the `onRegions` method if it exists
            if (this.onRegionsConf) {
                this.onRegionsConf();
            }
        },

        addRegions: function (regionDefinitions) {
            var _this = this;
            //return when nothing to add
            if (_.isEmpty(regionDefinitions)) {
                return;
            }

            return _.reduce(regionDefinitions, function (regions, selector, name) {
                regions[name] = _this._createRegion(selector);
                _this._addRegion(regions[name], name);
                return regions;
            }, {});
        },
        _createRegion: function (selector) {
            //pre-select the DOM element
            var el = this.$(selector);

            // create the region
            return new Region({el: el});
        },
        _addRegion: function (region, name) {
            // Call the `onBeforeAddRegion` method if it exists
            if (this.onBeforeAddRegion) {
                this.onBeforeAddRegion(name, region);
            }

            region._parentView = this;
            region._name = name;

            this._regions[name] = region;

            // Call the `onAfterAddRegion` method if it exists
            if (this.onAfterAddRegion) {
                this.onAfterAddRegion(name, region);
            }

        },
        //Remove region
        removeRegion: function (name) {
            var region = this._regions[name];

            this._removeRegion(region, name);

            return region;
        },
        _removeRegion: function (region, name) {
            // Call the `onBeforeRemoveRegion` method if it exists
            if (this.onBeforeRemoveRegion) {
                this.onBeforeRemoveRegion(name, region);
            }

            region.destroy();

            // Call the `onAfterRemoveRegion` method if it exists
            if (this.onAfterRemoveRegion) {
                this.onAfterRemoveRegion(name, region);
            }
        },
        //Close Layout
        destroy: function () {
            // close the Layout before close regions. Avoid reflow.
            ViewStructurePlugin.ModelView.prototype.destroy.call(this);
            // close the regions
            this.removeRegions();
        },
        removeRegions: function () {
            var regions = this._getRegions();
            _.each(this._regions, _.bind(this._removeRegion, this));
            // _.each(this._regions, function(selector, name){
            //     // grab the region by name, and close it
            //     var region = this[name];
            //     if (region && region.currentView && _.isFunction(region.currentView.destroy)){
            //         region.currentView.destroy();
            //     }
            // }, this);
            return regions;
        },

        // Checks to see if view contains region
        hasRegion(name) {
            return !!this.getRegion(name);
        },

        // Provides access to region
        getRegion(name) {
            if (!this._isRendered) {
                this.render();
            }
            return this._regions[name];
        },

        // Get all regions
        _getRegions() {
            return _.clone(this._regions);
        },

        getRegions() {
            if (!this._isRendered) {
                this.render();
            }
            return this._getRegions();
        },

        // Called in a region's destroy
        _removeReferences(name) {
            delete this.regions[name];
            delete this._regions[name];
        }
    });

    ViewStructurePlugin.Scroll = ViewStructurePlugin.CollectionModelView.extend({

        constructor: function (options) {
            ViewStructurePlugin.CollectionModelView.call(this, options);

            this.listenTo(this.collection, "shift", this._onCollectionChange);
            this.on('modelAdded modelRemoved render', this._onCollectionChange);
        },
        //elements number
        nb: 4,
        focusIdx: 1,
        _onCollectionChange: function () {
            this.trigger("focus", this._getFocusedChild(this.focusIdx));
        },
        _getFocusedChild: function (index) {
            return this.findByIndex(index);
        },
        getFocusedView: function () {
            return this._getFocusedChild(this.focusIdx);
        },
        forward: function () {
            var _this = this;
            if (this.collection && this.collection.length === this.nb) {
                if (this.isValid && !this.isValid(this.collection.last())) return;
                //Add pending event
                //this.collection.push(new Backbone.Model(pendingEventModel));

                //Make request
                this.collection.shiftForward && this.collection.shiftForward(function (err) {
                    err && _this.trigger('nextEvents', false);
                });
            }
        },
        back: function () {
            if (this.collection && this.collection.length === this.nb) {
                if (this.isValid && !this.isValid(this.collection.first())) return;
                //Add pending event
                //this.collection.unshift(new Backbone.Model(pendingEventModel));
                this.collection.shiftBack && this.collection.shiftBack(function(err) {
                    this.trigger('nextEvents', true);
                });
            }
        }
    });

    ViewStructurePlugin.Cycle = ViewStructurePlugin.CollectionModelView.extend({

        constructor: function (options) {
            ViewStructurePlugin.CollectionModelView.call(this, options);

            this.on('modelAdded modelRemoved render', this._onCollectionChange);
        },
        onInitialization: function (){
            if (!this.collection) {return;}

            this._layoutCount = this.layoutCount;
            var shift = this.shift();
            var model;
            var models = [];
            for (var i = 0; i < this._layoutCount; i++) {
                model = this.getByCycledIndex(this.focusIdx - shift + i);
                model && models.push(model.toJSON());
            }
            if (models.length > 0) {
                this.collection.reset(models, {silent: true});
            }
        },
        /**
         * Shift of focused item from middle of list.
         */
        focusShift: undefined,
        /**
         * Number of item displayed in layout
         */
        layoutCount: 1,
        /**
         * Focus index
         */
        focusIdx: 1,
        /**
         * Enables animation stop in case when scroller moves faster then animation
         */
        breakAnimation: false,

        _onCollectionChange: function () {
            this.trigger("focus", this._getFocusedChild(this.focusIdx));
        },
        _getFocusedChild: function (index) {
            return this.findByIndex(index);
        },
        getFocusedView: function () {
            return this._getFocusedChild(this.focusIdx);
        },
        //get focused model
        focused: function () {
            var view = this._getFocusedChild(this.focusIdx);
            return view.model;
        },
        forward: function () {
            var _this = this;
            if (this.collection && this.collection.length > 1) {
                var lastModel = this.collection.last();
                this.collection.pop();
                this.collection.unshift(lastModel);
                this.focusIdx++;
            }
        },
        back: function () {
            if (this.collection && this.collection.length > 1) {
                var firstModel = this.collection.first();
                this.collection.shift();
                this.collection.push(firstModel);
                this.focusIdx--;
            }
        },
        _getByCycledIndex: function (idx) {
            idx = idx % this.collection.length;
            if (idx < 0) {
                idx += this.collection.length;
            }
            return this.collection.at(idx);
        },
        getByCycledIndex: function (idx) {
            return this._getByCycledIndex(idx);
        },
        shift: function () {
            if (this.focusShift !== undefined) {
                return parseInt(this._layoutCount / 2 + this.focusShift);
            }
            return parseInt(this._layoutCount / 2);

        }
    });
    _.extend(ViewStructurePlugin.Cycle.prototype, Mixins.Animation);

    return ViewStructurePlugin;
}));
