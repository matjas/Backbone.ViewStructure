const Backbone = require('backbone');
const _ = require('underscore');
const ViewStructurePlugin = require('../../js/BackboneViewStructure');
const applicationRouter = require('../../js/router');
const books = require('../helpers/booksCollection');
const bookTemplate = require('./templates/book.html');

var BookView = ViewStructurePlugin.ModelView.extend({
    template: bookTemplate
});

var BookOnRenderView = ViewStructurePlugin.ModelView.extend({
    template: bookTemplate,
    onRender: function() {
        // call onRender to format date
        var date = new Date(this.model.get('published'));
        //update published
        this.$('.published').text(date.toDateString());
    }
});

var ModuleView = Backbone.View.extend({
    el: '#view-container',
    events: {
        'click .fetchModel': 'fetchModel',
        'click .clearModel': 'clearModel'   
    },
    template: _.template(
        '<h1>Model View</h1>\n<div class="row">\n    <section class="col">\n        <h3>Base usage</h3>\n        <pre>\n            <code>\n                var BookView = ViewStructurePlugin.ModelView.extend({\n                    el: \'body\',\n                    template: bookTemplate\n                });\n                var bookView = new BookView({model: bookObj});\n                bookView.render();\n            </code>\n        </pre>\n        <div class="operations">\n            <button class="fetchModel">Fetch Model</button>\n            <button class="clearModel">Clear Model</button>\n        </div>\n        <div class="modelView"></div>\n    </section>\n    <section class="col">\n        <h3>onRender method</h3>\n        <pre>\n            <code>\n                var BookOnRenderView = ViewStructurePlugin.ModelView.extend({\n                    el: \'body\'\n                    template: bookTemplate,\n                    onRender: function() {\n                        // call onRender to format date\n                        var date = new Date(this.model.get(\'published\'));\n                        //update published\n                        this.$(\'.published\').text(date.toDateString());\n                    }\n                });\n                var bookOnRenderView = new BookOnRenderView({model: bookObj});\n                bookOnRenderView.render();\n            </code>\n        </pre>\n        <div class="modelOnRenderView"></div>\n    </section>\n</div>'),
    initialize: function () {
        this.model = new (Backbone.Model.extend({url: '/examples/helpers/sbook.json'}));
        this.bookView = new BookView({
            model: this.model
        });
        this.bookOnRenderView = new BookOnRenderView({
            model: this.model
        });
        this.listenTo(applicationRouter, 'route:modelView', this.render);
    },
    render: function() {
        this.$el.html(this.template);
        this.$('.modelView').append(this.bookView.render().$el);
        this.$('.modelOnRenderView').append(this.bookOnRenderView.render().$el);
        return this;
    },
    fetchModel: function() {
        this.model.fetch();
    },
    clearModel: function(){
        this.model.clear();
        this.render()
    }
});

module.exports = ModuleView;