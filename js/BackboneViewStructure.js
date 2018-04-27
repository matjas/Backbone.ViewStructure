/**
 * Core of this plugin based on Backbone.Marionette which is under licence:
 * MIT Licence
 * Copyright © 2018 Muted Solutions, LLC <derick@mutedsolutions.com>
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Extended Backbone View with abstract view functionality
 *
 * Usage examples
 * https://github.com/matjas/Backbone.ViewStructure
 *
 * @module ViewStructure
 * @requires Backbone
 * @version 1.0.0
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['backbone', 'underscore', 'jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('backbone'), require('underscore'), require('jquery'));
    } else {
        root.Backbone.ViewStructure = factory(root.Backbone, root._, root.jQuery);
    }
}(this, function (Backbone, _, jQuery) {
    'use strict';

    //Common function for destroying view
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

            //this don't destroy view, only detach from DOM node
            _empty(view) {
                view.off('destroy');

                delete this.currentView;

                if (!view._isDestroyed) {
                    this._detachView();
                }
            },

            //detach from node
            _detachView() {
                _$el.contents().detach();
            },
            _getView(view) {

                if (view instanceof Backbone.View) {
                    return view;
                }

                return new ViewStructure.ModelView();
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
            // A method to render and show a new view
            openView: function (view) {
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
            // show an existing view,
            // if one is already in this DOM element
            show: function (view) {
                //destroy current view
                this.destroyView(this.currentView);
                //open view
                this.openView(view);

                view._isDestroyed = false;
                view.on("destroy", this.destroyView, this);

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
            //delete element
            reset: function () {
                delete this.$el;
                return this;
            },
            destroy: function () {

                this.reset();
                this.destroyView(this.currentView);

                //TODO:remove references after destroy Layout
                // if (this._name) {
                //     this._parentView._removeReferences(this._name);
                // }
                delete this._parentView;
                delete this._name;

                this._isDestroyed = true;

                return this;
            }
        });
        // export the Region type
        return R;
    })(Backbone, jQuery);

    //Mixins
    var Mixins = {};

    //ViewMixins
    Mixins.View = {
        _isRendered: false,

        isRendered() {
            return !!this._isRendered;
        },
        _isDestroyed: false,

        // Handle destroying the view and its children.
        destroy: function () {
            if (this._isDestroyed) {
                return this;
            }
            // Call the `onBeforeDestroy` method if it exists
            if (_.isFunction(this.onBeforeDestroy)) {
                this.onBeforeDestroy(this);
            }

            // remove the view from the DOM
            this._removeElement();

            // remove children after the remove to prevent extra paints
            this._removeChildren();

            this._isDestroyed = true;
            this._isRendered = false;

            if (_.isFunction(this.onDestroy)) {
                this.onDestroy(this);
            }

            this.stopListening();

            return this;
        },
        _removeElement(){
            this.$el.off();
            this.$el.remove();
            this.$el.contents().detach();
        }
    };

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
     * @alias module:ViewStructure
     * @class ViewStructure
     */

    var ViewStructure = {};

    /**
     * @alias module:ViewStructurePlugs
     * @class BaseView
     * @extends Backbone.View
     */
    ViewStructure.BaseView = Backbone.View.extend(/**@lends Backbone.View#*/{

        //default template
        template: "<div></div>",

        //Override constructor
        constructor: function (options) {
            Backbone.View.prototype.constructor.apply(this, arguments);
            this.buildTemplateCache();
        },

        //Compile template and store it into cache
        buildTemplateCache: function () {
            var proto = Object.getPrototypeOf(this);

            if (proto.templateCache || !this.template) {
                return;
            }
            proto.templateCache = _.isFunction(this.template) ? this.template : _.template(this.template);
        },

        render: function () {
            var data;

            //serialize data before render. Can be override  by user.
            if (_.isFunction(this.serializeData)) {
                data = this.serializeData();
            }

            // Call the `onBeforeRender` method if it exists
            if (_.isFunction(this.onBeforeRender)) {
                this.onBeforeRender();
            }

            // use the pre-compiled, cached template function
            var renderedHtml = this.templateCache(data);
            this.$el.html(renderedHtml);
            this._isRendered = true;

            // Call the `onRender` method if it exists
            if (_.isFunction(this.onRender)) {
                this.onRender();
            }
            this.trigger("render");

            return this;
        },

        // called by ViewMixin destroy
        _removeChildren: function () {
            this.removeRegions && this.removeRegions();
        }
    });

    _.extend(ViewStructure.BaseView.prototype, Mixins.View);

    /**
     * Display view based on model
     * @alias module:ViewStructure
     * @class ModelView
     * @extends ViewStructure.BaseView
     */
    ViewStructure.ModelView = ViewStructure.BaseView.extend(/**@lends ViewStructure.BaseView#*/{

        serializeData: function () {
            var data;

            if (this.model) {
                data = this.model.toJSON();
            }

            return data;
        }
    });

    /**
     * Create view from List. Items doesn't come from collection.
     * @alias module:ViewStructure
     * @class CollectionView
     * @extends ViewStructure.BaseView
     */
    ViewStructure.CollectionView = ViewStructure.BaseView.extend(/**@lends ViewStructure.BaseView#*/{
        serializeData: function () {
            var data;

            if (this.collection) {
                data = {items: this.collection.toJSON()};
            }

            return data;
        }
    });

    /**
     * Collection of Model Views. Each item based on ModelView
     * @alias module:ViewStructure
     * @class CollectionModelView
     * @extends ViewStructure.BaseView
     */
    ViewStructure.CollectionModelView = ViewStructure.BaseView.extend(/**@lends ViewStructure.BaseView#*/{

        constructor: function (options) {
            ViewStructure.BaseView.call(this, options);

            // set up storage for views
            this.children = {};

            this.listenTo(this.collection, "add", this.modelAdded);
            this.listenTo(this.collection, "remove", this.modelRemoved);
            this.listenTo(this.collection, "reset", this.render);

            //Fire directly after initialization.
            if(_.isFunction(this.onInitialization)){
                this.onInitialization();
            }
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

            //append item at the right place. (like collection order)
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

        // get child view by index
        //TODO: standarise this
        getNthChildView: function (idx) {
            var childEl = this.$el.find("> :nth-child(" + idx + ")");
            return childEl.length > 0 ? childEl[0] : undefined;
        },

        //get last child view
        //TODO: standarise this
        getLastChildView: function () {
            var view = this.$el.find("> :last-child");
            return view.length > 0 ? view[0] : undefined;
        },

        // get child view by model
        getChildViewByModel: function (model) {
            var child = this.children[model.cid];
            return child && child._view;
        },

        //find by Index and return view
        findByIndex: function (index) {
            if (this.collection.length > 0) {
                var model = this.collection.at(index);
                var child = model && this.children[model.cid];
                return child && child._view;
            }
        },

        // a method to close an individual view
        closeChildView: function (child) {
            if (!child) {
                return;
            }

            // remove the view, if the method is there
            if (_.isFunction(child._view.remove)){
                child._view.remove();
            }
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
        // render the entire collection
        render: function () {
            if (this._isDestroyed) {return this;}

            // Call the `onBeforeRender` method if it exists
            if (_.isFunction(this.onBeforeRender)) {
                this.onBeforeRender();
            }
            this._renderChildren();
            this._isRendered = true;

            if (_.isFunction(this.onRender)) {
                this.onRender();
            }

            this.trigger('render');

            return this;
        },
        // override remove and have it
        // close all the children
        remove: function () {
            ViewStructure.BaseView.prototype.remove.call(this);
            this.closeChildren();
        }

    });

    /**
     * View allow create regions and place in regions customized views
     * @alias module:ViewStructure
     * @class Layout
     * @extends ViewStructure.ModelView
     */
    ViewStructure.Layout = ViewStructure.ModelView.extend(/**@lends ViewStructure.ModelView#*/{

        _configureRegions: function () {
            this.regions = this.regions || {};
            this._regions = {};

            this.addRegions(_.result(this, 'regions'));

            // Call the `onRegions` method if it exists
            if (_.isFunction(this.onRegionsConf)) {
                this.onRegionsConf();
            }
        },

        _createRegion: function (selector) {
            //pre-select the DOM element
            var el = this.$(selector);

            // create the region
            return new Region({el: el});
        },
        _addRegion: function (region, name) {
            // Call the `onBeforeAddRegion` method if it exists
            if (_.isFunction(this.onBeforeAddRegion)) {
                this.onBeforeAddRegion(name, region);
            }

            region._parentView = this;
            region._name = name;

            this._regions[name] = region;

            // Call the `onAfterAddRegion` method if it exists
            if (_.isFunction(this.onAddRegion)) {
                this.onAddRegion(name, region);
            }

        },

        render: function () {
            // close the old regions, if any exist
            this.removeRegions();

            // call the original
            var result = ViewStructure.ModelView.prototype.render.call(this);

            // call to process the regions
            this._configureRegions();

            return result;
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
        //Remove region
        removeRegion: function (name) {
            var region = this._regions[name];

            this._removeRegion(region, name);

            return region;
        },
        _removeRegion: function (region, name) {
            // Call the `onBeforeRemoveRegion` method if it exists
            if (_.isFunction(this.onBeforeRemoveRegion)) {
                this.onBeforeRemoveRegion(name, region);
            }

            region.destroy();

            // Call the `onAfterRemoveRegion` method if it exists
            if (_.isFunction(this.onRemoveRegion)) {
                this.onRemoveRegion(name, region);
            }
        },
        //Close Layout
        destroy: function () {
            // close the Layout before close regions. Avoid reflow.
            ViewStructure.ModelView.prototype.destroy.call(this);
            // close the regions
            //this.removeRegions();
        },
        removeRegions: function () {
            var regions = this._getRegions();
            _.each(this._regions, _.bind(this._removeRegion, this));
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

    /**
     * Scroll view.
     * @alias module:ViewStructure
     * @class Layout
     * @extends ViewStructure.ModelView
     */
    ViewStructure.Scroll = ViewStructure.CollectionModelView.extend({

        constructor: function (options) {
            ViewStructure.CollectionModelView.call(this, options);

            this.listenTo(this.collection, "shift", this._onCollectionChange);
            this.on('modelAdded modelRemoved', this._onCollectionChange);
        },
        //elements number
        nb: 4,
        focusIdx: 1,
        _toggleFocus: function (focusedChildView){
            _.each(this.children, function(view){
                view.focus = false;
            });
            focusedChildView.focus = true;
        },
        _onCollectionChange: function () {
            var focusedChild = this._getFocusedChild(this.focusIdx);
            if(focusedChild){
                this._toggleFocus(focusedChild);
                this.trigger("focus", focusedChild);
                focusedChild.trigger('focus');
            }
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

                //Make request
                this.collection.shiftForward && this.collection.shiftForward(function (err) {
                    err && _this.trigger('nextEvents', false);
                });
            }
        },
        back: function () {
            var _this = this;
            if (this.collection && this.collection.length === this.nb) {
                if (this.isValid && !this.isValid(this.collection.first())) return;

                this.collection.shiftBack && this.collection.shiftBack(function(err) {
                    _this.trigger('nextEvents', true);
                });
            }
        }
    });

    // ViewStructure.Cycle = ViewStructure.CollectionModelView.extend({
    //
    //     constructor: function (options) {
    //         ViewStructure.CollectionModelView.call(this, options);
    //
    //         this.on('modelAdded modelRemoved render', this._onCollectionChange);
    //     },
    //     onInitialization: function (){
    //         if (!this.collection) {return;}
    //
    //         this._layoutCount = this.layoutCount;
    //         var shift = this.shift();
    //         var model;
    //         var models = [];
    //         for (var i = 0; i < this._layoutCount; i++) {
    //             model = this.getByCycledIndex(this.focusIdx - shift + i);
    //             model && models.push(model.toJSON());
    //         }
    //         if (models.length > 0) {
    //             this.collection.set(models);
    //         }
    //     },
    //     /**
    //      * Shift of focused item from middle of list.
    //      */
    //     focusShift: undefined,
    //     /**
    //      * Number of item displayed in layout
    //      */
    //     layoutCount: 1,
    //     /**
    //      * Focus index
    //      */
    //     focusIdx: 1,
    //     /**
    //      * Enables animation stop in case when scroller moves faster then animation
    //      */
    //     breakAnimation: false,
    //
    //     _onCollectionChange: function () {
    //         this.trigger("focus", this._getFocusedChild(this.focusIdx));
    //     },
    //     _getFocusedChild: function (index) {
    //         return this.findByIndex(index);
    //     },
    //     getFocusedView: function () {
    //         return this._getFocusedChild(this.focusIdx);
    //     },
    //     //get focused model
    //     focused: function () {
    //         var view = this._getFocusedChild(this.focusIdx);
    //         return view.model;
    //     },
    //     forward: function () {
    //         var _this = this;
    //         if (this.collection && this.collection.length > 1) {
    //             var lastModel = this.collection.last();
    //             this.collection.pop();
    //             this.collection.unshift(lastModel);
    //             this.focusIdx++;
    //         }
    //     },
    //     back: function () {
    //         if (this.collection && this.collection.length > 1) {
    //             var firstModel = this.collection.first();
    //             this.collection.shift();
    //             this.collection.push(firstModel);
    //             this.focusIdx--;
    //         }
    //     },
    //     _getByCycledIndex: function (idx) {
    //         idx = idx % this.collection.length;
    //         if (idx < 0) {
    //             idx += this.collection.length;
    //         }
    //         return this.collection.at(idx);
    //     },
    //     getByCycledIndex: function (idx) {
    //         return this._getByCycledIndex(idx);
    //     },
    //     shift: function () {
    //         if (this.focusShift !== undefined) {
    //             return parseInt(this._layoutCount / 2 + this.focusShift);
    //         }
    //         return parseInt(this._layoutCount / 2);
    //
    //     }
    // });
    // _.extend(ViewStructure.Cycle.prototype, Mixins.Animation);

    // ViewStructure.ScrollArea = ViewStructure.ModelView.extend({
    //     step: 20,
    //     onBeforeRender: function() {
    //         this.$el.html('<div style="overflow: hidden"><%- content %></div>');
    //         this.offset = 0;
    //     },
    //     // render: function () {
    //     //     this.$el.html('<div style="overflow: hidden">' + this.contentRender() + '</div>');
    //     //     this.offset = 0;
    //     //     this.trigger("render");
    //     //
    //     //     return this;
    //     // },
    //     // onRender: function () {
    //     //     this.offset = 0;
    //     // },
    //     size: function (customHeight) {
    //         if (customHeight === undefined) {
    //             return this.$el.height();
    //         }
    //         this.$el.css("height", customHeight);
    //     },
    //     contentSize: function () {
    //         return this.$el.children().height();
    //     },
    //     shift: function (x) {
    //         this.offset = x;
    //         this.$el.children().css('-webkit-transform', 'translateY(' + (-x) + 'px)');
    //     },
    //     // contentRender: function () {
    //     //     return (this.model && _.escape(JSON.stringify(this.model.toJSON()))) || '';
    //     // },
    //     forward: function () {
    //         var shift = this.offset + this.step;
    //         var size = this.size();
    //         var contentSize = this.contentSize();
    //         if (contentSize > size) {
    //             if (size + shift > contentSize) {
    //                 shift = contentSize - size;
    //             }
    //             this.shift(shift);
    //         }
    //     },
    //     back: function () {
    //         if (this.offset === 0) {
    //             return true;
    //         }
    //         var shift = this.offset - this.step;
    //         if (shift < 0) {
    //             shift = 0;
    //         }
    //         this.shift(shift);
    //
    //         return false;
    //     },
    //     reset: function() {
    //         this.shift(0);
    //     },
    //     isScrollNeeded: function() {
    //         return this.contentSize() > this.size();
    //     }
    // });

    return ViewStructure;
}));
