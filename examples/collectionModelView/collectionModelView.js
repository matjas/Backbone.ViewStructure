const Backbone = require('backbone');
const _ = require('underscore');
const ViewStructurePlugin = require('../../js/BackboneViewStructure');
const applicationRouter = require('../../js/router');
const books = require('../helpers/booksCollection');
const bookTemplate = require('./templates/book.html');

var BookView = ViewStructurePlugin.ModelView.extend({
    template: bookTemplate
});

var BooksCollectionModelView = ViewStructurePlugin.CollectionModelView.extend({
    template: bookTemplate,
    modelView: BookView
});


var CollectionModelView = Backbone.View.extend({
    el: '#view-container',
    template: _.template(
        '<h1>Collection Model View</h1>\n<div class="row">\n    <scetion class="col">\n        <h3>Base usage</h3>\n        <pre>\n            <code>\n                var BookView = ViewStructurePlugin.ModelView.extend({\n                    el: \'body\',\n                    template: bookTemplate\n                });\n                var bookView = new BookView({model: bookObj});\n                bookView.render();\n            </code>\n        </pre>\n        <div class="collectionModelView"></div>\n    </scetion>\n</div>'),
    initialize: function () {
        this.collectionModelView = new BooksCollectionModelView ({
            collection: new Backbone.Collection(books)
        });
        
        this.listenTo(applicationRouter, 'route:collectionModelView', this.render);
    },
    render: function() {
        this.$el.html(this.template);
        var cl = this.collectionModelView.render().$el;
        this.$('.collectionModelView').append(cl);
        return this;
    }
});

module.exports = CollectionModelView;