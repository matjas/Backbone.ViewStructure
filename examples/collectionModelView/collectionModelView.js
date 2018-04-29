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
    modelView: BookView
});

var CollectionModelView = Backbone.View.extend({
    el: '#view-container',
    events: {
        'click .addToCollection': 'addToCollection',
        'click .removeFromCollection': 'removeFromCollection',
        'click .resetCollection': 'resetCollection',
        'click .destroyView': 'destroyView'
    },
    template: _.template(
        '<h1>Collection Model View</h1>\n<div class="row">\n    <section class="col">\n        <h3>Base usage</h3>\n        <pre>\n            <code>\n               var BookView = ViewStructurePlugin.ModelView.extend({\n                    template: bookTemplate\n                });\n\n                var BooksCollectionModelView = ViewStructurePlugin.CollectionModelView.extend({\n                    modelView: BookView\n                });\n                \n                var collectionModelView = new BooksCollectionModelView ({\n                    collection: this.booksCollection\n                });\n                \n                collectionModelView.render();\n            </code>\n        </pre>\n        <div class="operations">\n            <button class="addToCollection">Add</button>\n            <button class="removeFromCollection">Remove</button>\n            <button class="resetCollection">Reset</button>\n            <button class="destroyView">Destroy view</button>\n        </div>\n        <div class="collectionModelView"></div>\n    </section>\n</div>'),
    initialize: function () {
        this.booksCollection = new Backbone.Collection(books);
        this.collectionModelView = new BooksCollectionModelView ({
            collection: this.booksCollection
        });
        
        this.listenTo(applicationRouter, 'route:collectionModelView', this.render);
    },
    render: function() {
        this.$el.html(this.template);
        let cl = this.collectionModelView.render().$el;
        this.$('.collectionModelView').append(cl);
        return this;
    },
    addToCollection: function () {
        let newBook = books[0];
        newBook.title = "new Book";
        this.booksCollection.add([newBook]);
    },
    removeFromCollection: function () {
        this.booksCollection.remove(this.booksCollection.at(0));
    },
    resetCollection: function () {
        this.booksCollection.reset(books);
    },
    destroyView: function () {
        this.collectionModelView.remove();
    }
});

module.exports = CollectionModelView;