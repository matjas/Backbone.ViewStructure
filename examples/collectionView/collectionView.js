const Backbone = require('backbone');
const _ = require('underscore');
const applicationRouter = require('../../js/router');

var CollectionView = Backbone.View.extend({
    el: '#view-container',
    template: _.template([
        '<div>This is Collection view</div>'
    ].join('')),
    initialize: function () {
        this.listenTo(applicationRouter, 'route:collectionView', this.render);
    },
    render: function() {
        this.$el.html(this.template());
        return this;
    }
    
});

module.exports = CollectionView;