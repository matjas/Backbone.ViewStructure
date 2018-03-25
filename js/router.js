const $ = require('jquery');
const _ = require('underscore');
const Backbone = require('backbone');

var ApplicationRouter = Backbone.Router.extend({

    //map url routes to contained methods
    routes: {
        "": "home",
        "home": "home",
        "modelView": "modelView",
        "collectionView": "collectionView"
    },

    deselectMenu: function(){
        $('ul.menu li').removeClass('active');
    },

    selectMenu: function(menu){
        this.deselectMenu();
        //select passed navigation pill by selector
        $(menu).addClass('active');
    },

    home: function() {
        this.selectMenu('.home-menu');
    },

    modelView: function() {
        this.selectMenu('.modelView-menu');
    },

    collectionView: function() {
        this.selectMenu('.collectionView-menu');
    }

});

module.exports = new ApplicationRouter();
