const Backbone = require('backbone');
const _ = require('underscore');
const ViewStructurePlugin = require('../../js/BackboneViewStructure');
const applicationRouter = require('../../js/router');
const cycleItem = require('./templates/item.html');

var CycleItemView = ViewStructurePlugin.ModelView.extend({
    template: cycleItem
});

var CycleView = ViewStructurePlugin.Cycle.extend({
    modelView: CycleItemView,
    initialize: function(){
        this.layoutCount = this.collection.length + 2;
        if (this.layoutCount > 6) {
            this.layoutCount = 6;
        }
        this.focusShift = -parseInt(this.layoutCount / 2) + 1;
    }
});

var CycleViewContainer = Backbone.View.extend({
    el: '#view-container',
    events: {
        'click .forward': 'forward',
        'click .back': 'back'
    },
    template: _.template(
        '<h1>Cycle View</h1>\n<div class="row">\n    <section class="col">\n        <h3>Base usage</h3>\n        <pre>\n            <code>\n                var CycleItemView = ViewStructurePlugin.ModelView.extend({\n                    template: cycleItem\n                });\n                \n                var CycleView = ViewStructurePlugin.Cycle.extend({\n                    modelView: CycleItemView\n                });\n                \n                this.cycleView = new CycleView ({\n                    collection: this.items\n                });\n                \n                cycleView.render();\n            </code>\n        </pre>\n        <div class="operations">\n            <button class="forward">Forward</button>\n            <button class="back">Back</button>\n        </div>\n        <div class="cycleView"></div>\n    </section>\n</div>'),
    initialize: function () {
        this.items = new Backbone.Collection([
            {text: 'item1'},
            {text: 'item2'},
            {text: 'item3'}
        ]);
        this.cycleView = new CycleView ({
            collection: this.items
        });

        this.listenTo(applicationRouter, 'route:cycleView', this.render);
    },
    render: function() {
        this.$el.html(this.template);
        let cl = this.cycleView.render().$el;
        this.$('.cycleView').append(cl);
        return this;
    },
    forward: function () {
        this.cycleView.forward();
    },
    back: function () {
        this.cycleView.back();
    }
});

module.exports = CycleViewContainer;
