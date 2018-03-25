const Backbone = require('backbone');
const _ = require('underscore');
const applicationRouter = require('../../js/router');
const books = require('../helpers/booksCollection');

var ModuleView = Backbone.View.extend({
    el: '#view-container',
    template: _.template([
        '<div>This is model view</div>'
    ].join('')),
    initialize: function () {
        this.listenTo(applicationRouter, 'route:modelView', this.render);
    },
    render: function() {
        this.$el.html(this.template());
        return this;
    }
});

module.exports = ModuleView;