const Backbone = require('backbone');
const _ = require('underscore');
const ViewStructurePlugin = require('../../js/BackboneViewStructure');
const applicationRouter = require('../../js/router');
const layout = require('./templates/layout.html');
const books = require('../helpers/booksCollection');
const bookTemplate = require('./templates/book_short.html');

var LayoutView = ViewStructurePlugin.Layout.extend({
    template: layout,
    regions: {
        region1: '.reg1',
        region2: '.reg2',
        region3: '.reg3'
    }
});

var BookView = ViewStructurePlugin.ModelView.extend({
    template: bookTemplate
});

var BooksCollectionModelView = ViewStructurePlugin.CollectionModelView.extend({
    modelView: BookView
});

var ModuleView = Backbone.View.extend({
    el: '#view-container',
    events: {
        "click .createLayoutCollection": "createLayout",
        "click .destroyLayoutCollection": "destroyLayout"
    },
    template: _.template(
        '<h1>Layout View</h1>\n<div class="row">\n    <section class="col">\n        <h3>Base usage</h3>\n        <pre>\n            <code>\n                var layout =\n                    &lt;div&gt;\n                        &lt;div class="reg1"&gt;&lt;div&gt;\n                        &lt;div class="reg2"&gt;&lt;div&gt;\n                        &lt;div class="reg3"&gt;&lt;div&gt;\n                    &lt;div&gt;\n                \n                var LayoutView = ViewStructurePlugin.Layout.extend({\n                    template: layout,\n                    regions: {\n                        region1: \'.reg1\',\n                        region2: \'.reg2\',\n                        region3: \'.reg3\'\n                    }\n                });\n                \n                var BookView = ViewStructurePlugin.ModelView.extend({\n                    template: bookTemplate\n                });\n                \n                var BooksCollectionModelView = ViewStructurePlugin.CollectionModelView.extend({\n                    modelView: BookView\n                });\n\n                var layoutView = new LayoutView();\n                this.region1 = new BooksCollectionModelView({\n                    collection: this.booksCollection1\n                });\n                this.region2 = new BooksCollectionModelView({\n                    collection: this.booksCollection2\n                });\n                this.region3 = new BooksCollectionModelView({\n                    collection: this.booksCollection3\n                });\n                \n                layoutView.render();\n                \n                //show regions\n                var regions = this.layoutView.getRegions();\n                regions.region1.show(this.region1);\n                regions.region2.show(this.region2);\n                regions.region3.show(this.region3);\n                \n            </code>\n        </pre>\n        <div class="operations">\n            <button class="createLayoutCollection">Create layout</button>\n            <button class="destroyLayoutCollection">Destroy layout</button>\n        </div>\n        <div class="layoutView"></div>\n    </section>\n</div>'),
    initialize: function () {
        this.initLayout();
        this.listenTo(applicationRouter, 'route:layoutCollection', this.render);
    },
    render: function() {
        this.$el.html(this.template);
        this.$('.layoutView').append(this.layoutView.render().$el);
        var regions = this.layoutView.getRegions();
        regions.region1.show(this.region1);
        regions.region2.show(this.region2);
        regions.region3.show(this.region3);
        return this;
    },
    openRegion2: function() {
        var regions = this.layoutView.getRegions();
        regions.region2.openView(this.region2);
    },
    closeRegion2: function() {
        var regions = this.layoutView.getRegions();
        regions.region2.closeView();
    },
    initLayout: function () {
        this.layoutView = new LayoutView();
        this.initCollections();
        this.region1 = new BooksCollectionModelView({
            collection: this.booksCollection1
        });
        this.region2 = new BooksCollectionModelView({
            collection: this.booksCollection2
        });
        this.region3 = new BooksCollectionModelView({
            collection: this.booksCollection3
        });
    },
    initCollections: function() {
        this.booksCollection1 = new Backbone.Collection(books);
        this.booksCollection2 = new Backbone.Collection(books);
        this.booksCollection3 = new Backbone.Collection(books);
    },
    createLayout: function() {
        this.initLayout();
        this.render();
    },
    destroyLayout: function() {
        this.layoutView.remove();
    }
});

module.exports = ModuleView;