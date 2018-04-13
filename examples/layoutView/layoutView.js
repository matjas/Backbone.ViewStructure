const Backbone = require('backbone');
const _ = require('underscore');
const ViewStructurePlugin = require('../../js/BackboneViewStructure');
const applicationRouter = require('../../js/router');
const layout = require('./templates/layout.html');
const region1 = require('./templates/region1.html');
const region2 = require('./templates/region2.html');
const region3 = require('./templates/region3.html');

var LayoutView = ViewStructurePlugin.Layout.extend({
    template: layout,
    regions: {
        region1: '.reg1',
        region2: '.reg2',
        region3: '.reg3'
    }
});

var Region1View = ViewStructurePlugin.ModelView.extend({
    template: region1
});

var Region2View = ViewStructurePlugin.ModelView.extend({
    template: region2
});

var Region3View = ViewStructurePlugin.ModelView.extend({
    template: region3
});

var ModuleView = Backbone.View.extend({
    el: '#view-container',
    events: {
      "click .openRegion2": "openRegion2",
      "click .closeRegion2": "closeRegion2"
    },
    template: _.template(
        '<h1>Layout View</h1>\n<div class="row">\n    <section class="col">\n        <h3>Base usage</h3>\n        <pre>\n            <code>\n                var layout =\n                    &lt;div&gt;\n                        &lt;div class="reg1"&gt;&lt;div&gt;\n                        &lt;div class="reg2"&gt;&lt;div&gt;\n                        &lt;div class="reg3"&gt;&lt;div&gt;\n                    &lt;div&gt;\n                \n                var LayoutView = ViewStructurePlugin.Layout.extend({\n                    template: layout,\n                    regions: {\n                        region1: \'.reg1\',\n                        region2: \'.reg2\',\n                        region3: \'.reg3\'\n                    }\n                });\n                \n                var Region1View = ViewStructurePlugin.ModelView.extend({\n                    template: region1\n                });\n                \n                var Region2View = ViewStructurePlugin.ModelView.extend({\n                    template: region2\n                });\n                \n                var Region3View = ViewStructurePlugin.ModelView.extend({\n                    template: region3\n                });\n                var layoutView = new LayoutView();\n                var region1 = new Region1View();\n                var region2 = new Region2View();\n                var region3 = new Region3View();\n                \n                layoutView.render();\n                \n                //show regions\n                layoutView.region1.show(region1);\n                layoutView.region2.show(region2);\n                layoutView.region3.show(region3);\n                \n                //close region 2\n                layoutView.region2.closeView(region2);\n                \n                //open region 2\n                layoutView.region2.openView(region2);\n            </code>\n        </pre>\n        <div class="operations">\n            <button class="closeRegion2">Close region2</button>\n            <button class="openRegion2">open region2</button>\n        </div>\n        <div class="layoutView"></div>\n    </section>\n</div>'),
    initialize: function () {
        this.layoutView = new LayoutView();
        this.region1 = new Region1View();
        this.region2 = new Region2View();
        this.region3 = new Region3View();
        this.listenTo(applicationRouter, 'route:layoutView', this.render);
    },
    render: function() {
        this.$el.html(this.template);
        this.$('.layoutView').append(this.layoutView.render().$el);
        this.layoutView.region1.show(this.region1);
        this.layoutView.region2.show(this.region2);
        this.layoutView.region3.show(this.region3);
        return this;
    },
    openRegion2: function() {
        this.layoutView.region2.openView(this.region2);
    },
    closeRegion2: function() {
        this.layoutView.region2.closeView(this.region2);
    }
});

module.exports = ModuleView;