const Backbone = require('backbone');
const _ = require('underscore');
const ViewStructurePlugin = require('../../js/BackboneViewStructure');
const applicationRouter = require('../../js/router');
const books = require('../helpers/booksCollection');
const bookTemplate = require('./templates/book.html');

var BookView = ViewStructurePlugin.ModelView.extend({
    template: bookTemplate,
    onRender: function() {
        //onRender code
    }
});

var ModuleView = Backbone.View.extend({
    el: '#view-container',
    template: _.template(
        '<h1>Model View</h1>\n<div class="row">\n    <div class="col content"></div>\n</div>'),
    initialize: function () {
        this.bookView = new BookView({
            model: new Backbone.Model(books[0])
        });
        this.listenTo(applicationRouter, 'route:modelView', this.render);
    },
    render: function() {
        this.$el.html(this.template);
        this.$('.content').append(this.bookView.render().$el);
        return this;
    }
});

module.exports = ModuleView;