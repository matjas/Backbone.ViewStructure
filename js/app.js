const $ = require('jquery');
const _ = require('underscore');
const Backbone = require('backbone');
const examples = require('../examples/index');
const applicationRouter = require('./router');
require('../style/app.less');

var HomeView = Backbone.View.extend({
    el: '#view-container',
    template: _.template([
        '<div>This is home view</div>'
    ].join('')),
    initialize: function () {
        this.listenTo(applicationRouter, 'route:home', this.render);
    },
    render: function() {
        this.$el.html(this.template());
        return this;
    }

});

var ApplicationView = Backbone.View.extend({
    
    el: $('body'),
    
    events: {
        'click .home-menu': 'displayHome',
        'click .modelView-menu': 'displayModelView',
        'click .collectionView-menu': 'displayCollectionView',
        'click .collectionModelView-menu': 'displayCollectionModelView'
    },

    initialize: function(){
        this.homeView = new HomeView();

        //call to begin monitoring uri and route changes
        Backbone.history.start();
    },

    displayHome: function(){
        applicationRouter.navigate("home", true);
        this.homeView.render();
    },

    displayModelView: function(){
        applicationRouter.navigate("modelView", true);
    },

    displayCollectionView: function(){
        applicationRouter.navigate("collectionView", true);
    },

    displayCollectionModelView: function(){
        applicationRouter.navigate("collectionModelView", true);
    }

});

//load application
new ApplicationView();