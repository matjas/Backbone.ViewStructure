const $ = require('jquery');
const _ = require('underscore');
const Backbone = require('backbone');

var ApplicationRouter = Backbone.Router.extend({

    //map url routes to contained methods
    routes: {
        "": "home",
        "home": "home",
        "modelView": "modelView",
        "collectionView": "collectionView",
        "collectionModelView": "collectionModelView",
        "layoutView": "layoutView",
        "cycleView": "cycleView"
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
    },

    collectionModelView: function() {
        this.selectMenu('.collectionModelView-menu');
    },

    layoutView: function() {
        this.selectMenu('.layoutView-menu')
    },

    cycleView: function() {
        this.selectMenu('.cycleView-menu')
    }
});

module.exports = new ApplicationRouter();
