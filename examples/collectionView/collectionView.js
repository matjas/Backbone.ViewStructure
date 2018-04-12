const Backbone = require('backbone');
const _ = require('underscore');
const ViewStructurePlugin = require('../../js/BackboneViewStructure');
const applicationRouter = require('../../js/router');
const books = require('../helpers/booksCollection');
const booksTemplate = require('./templates/booksList.html');

var BooksCollectionView = ViewStructurePlugin.CollectionView.extend({
    template: booksTemplate
});


var CollectionView = Backbone.View.extend({
    el: '#view-container',
    template: _.template(
        '<h1>Collection View</h1>\n<div class="row">\n    <section class="col">\n        <h3>Base usage</h3>\n        <pre>\n            <code>\n                var BookView = ViewStructurePlugin.ModelView.extend({\n                    el: \'body\',\n                    template: bookTemplate\n                });\n                var bookView = new BookView({model: bookObj});\n                bookView.render();\n            </code>\n        </pre>\n        <div class="collectionView"></div>\n    </section>\n</div>'),
    initialize: function () {
        this.collectionView = new BooksCollectionView({
            collection: new Backbone.Collection(books)
        });
        
        this.listenTo(applicationRouter, 'route:collectionView', this.render);
    },
    render: function() {
        this.$el.html(this.template);
        this.$('.collectionView').append(this.collectionView.render().$el);
        return this;
    }
});

module.exports = CollectionView;