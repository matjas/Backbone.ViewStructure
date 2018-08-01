//import {setup} from './setup';

//replace jasmine assertion expect by chai expect
var expect = chai.expect;

var $container;

function setContent() {
    _.each(arguments, function (content) {
        $container.append(content);
    });
}

function clearContainer() {
    $container.empty();
}

function before() {
    $container = $('<div id="testContainer">');
    $('body').append($container);
}

beforeEach(function () {
    this.sinon = sinon.createSandbox();
});

afterEach(function () {
    this.sinon.restore();
});

function after() {
    window.location.hash = '';
    Backbone.history.stop();
    Backbone.history.handlers.length = 0;
    clearContainer();
}

describe('creating ModelView', function () {

    //var sinon = sinon.sandbox.create();
    beforeEach(function () {
        this.initializeStub = this.sinon.stub();

        var ModelView = ViewStructure.ModelView.extend({
            initialize: this.initializeStub
        });

        this.modelView = new ModelView();

        before();
    });

    afterEach(function () {
        after();
    });

    it('should call initialize', function () {
        expect(this.initializeStub).to.have.been.calledOnce;
    });
});

describe('creating collectionModelView', function () {

    beforeEach(function () {
        this.initializeStub = this.sinon.stub();

        var CollectionModelView = ViewStructure.CollectionModelView.extend({
            initialize: this.initializeStub
        });

        this.collectionModelView = new CollectionModelView();

        before();
    });

    afterEach(function () {
        after();
    });

    it('should call initialize', function () {
        expect(this.initializeStub).to.have.been.calledOnce;
    });
});

describe('creating layoutView', function () {

    beforeEach(function () {
        this.initializeStub = this.sinon.stub();

        var LayoutView = ViewStructure.Layout.extend({
            initialize: this.initializeStub
        });

        this.layoutView = new LayoutView();

        before();
    });

    afterEach(function () {
        after();
    });

    it('should call initialize', function () {
        expect(this.initializeStub).to.have.been.calledOnce;
    });
});

/**
 * Destroy View tests
 */

describe('when using listenTo for the "destroy" event on itself, and destroying the modelView', function () {
    beforeEach(function () {
        this.destroyStub = this.sinon.stub();
        this.modelView = new ViewStructure.ModelView();
        this.modelView.listenTo(this.modelView, 'destroy', this.destroyStub);
        this.modelView.destroy();
    });

    it('should trigger the "destroy" event', function () {
        expect(this.destroyStub).to.have.been.called;
    });
});

describe('when using listenTo for the "destroy" event on itself, and destroying the collectionModelView', function () {
    beforeEach(function () {
        this.destroyStub = this.sinon.stub();
        this.collectionModelView = new ViewStructure.CollectionModelView();
        this.collectionModelView.listenTo(this.collectionModelView, 'destroy', this.destroyStub);
        this.collectionModelView.destroy();
    });

    it('should trigger the "destroy" event', function () {
        expect(this.destroyStub).to.have.been.called;
    });
});

describe('when using listenTo for the "destroy" event on itself, and destroying the layoutView', function () {
    beforeEach(function () {
        this.destroyStub = this.sinon.stub();
        this.layoutView = new ViewStructure.Layout();
        this.layoutView.listenTo(this.layoutView, 'destroy', this.destroyStub);
        this.layoutView.destroy();
    });

    it('should trigger the "destroy" event', function () {
        expect(this.destroyStub).to.have.been.called;
    });
});

describe('when destroying a modelView', function () {
    beforeEach(function () {
        this.modelView = new ViewStructure.ModelView();

        this.sinon.spy(this.modelView, '_removeElement');
        this.sinon.spy(this.modelView, '_removeChildren');
        this.sinon.spy(this.modelView, 'destroy');

        this.onDestroyStub = this.sinon.stub();
        this.modelView.onDestroy = this.onDestroyStub;

        this.destroyStub = this.sinon.stub();
        this.modelView.on('destroy', this.destroyStub);

        this.modelView.remove();
    });

    it('should trigger the destroy event', function () {
        expect(this.destroyStub).to.have.been.calledOnce;
    });

    it('should remove the modelView', function () {
        expect(this.modelView._removeElement).to.have.been.calledOnce;
    });

    it('should remove the modelView children', function () {
        expect(this.modelView._removeChildren).to.have.been.calledOnce;
    });

    it('should set the modelView _isDestroyed to true', function () {
        expect(this.modelView).to.be.have.property('_isDestroyed', true);
    });

    it('should set the modelView _isRendered to false', function () {
        expect(this.modelView).to.be.have.property('_isRendered', false);
    });

    it('should return the View', function () {
        expect(this.modelView.destroy).to.have.returned(this.modelView);
    });

    describe('and it has already been destroyed', function () {
        beforeEach(function () {
            this.modelView.destroy();
        });

        it('should return the View', function () {
            expect(this.modelView.destroy).to.have.returned(this.modelView);
        });

        it('should remove the modelView', function () {
            expect(this.modelView._removeElement).to.have.been.calledOnce;
        });
    });

    describe('_isDestroyed property', function () {
        beforeEach(function () {
            this.modelView = new ViewStructure.ModelView();
        });

        it('should be set to false before destroy', function () {
            expect(this.modelView).to.be.have.property('_isDestroyed', false);
        });

        it('should be set to true after destroying', function () {
            this.modelView.destroy();
            expect(this.modelView).to.be.have.property('_isDestroyed', true);
        });
    });
});

describe('when destroying a modelView and returning false from the onBeforeDestroy method', function () {
    beforeEach(function () {
        this.modelView = new ViewStructure.ModelView();

        this.removeSpy = this.sinon.spy(this.modelView, '_removeElement');

        this.destroyStub = this.sinon.stub();
        this.modelView.on('destroy', this.destroyStub);

        this.onBeforeDestroyStub = this.sinon.stub().returns(false);
        this.modelView.onBeforeDestroy = this.onDestroyStub;

        this.modelView.destroy();
    });

    it('should not trigger the destroy event', function () {
        expect(this.destroyStub).to.have.been.calledOnce;
    });

    it('should not remove the modelView', function () {
        expect(this.removeSpy).to.have.been.calledOnce;
    });

    it('should not set the modelView _isDestroyed to true', function () {
        expect(this.modelView).to.be.have.property('_isDestroyed', true);
    });
});

describe('when destroying a view and returning undefined from the onBeforeDestroy method', function () {
    beforeEach(function () {
        this.modelView = new ViewStructure.ModelView();

        this.removeSpy = this.sinon.spy(this.modelView, '_removeElement');

        this.destroyStub = this.sinon.stub();
        this.modelView.on('destroy', this.destroyStub);

        this.onBeforeDestroyStub = this.sinon.stub().returns(false);
        this.modelView.onBeforeDestroy = this.onBeforeDestroyStub;
        this.sinon.spy(this.modelView, 'destroy');

        this.modelView.destroy();
    });

    it('should trigger the destroy event', function () {
        expect(this.destroyStub).to.have.been.calledOnce;
    });

    it('should remove the view', function () {
        expect(this.removeSpy).to.have.been.calledOnce;
    });

    it('should set the view _isDestroyed to true', function () {
        expect(this.modelView).to.have.property('_isDestroyed', true);
    });

    it('should return the view', function () {
        expect(this.modelView.destroy).to.have.returned(this.modelView);
    });
});

describe('when destroying a view that is already destroyed', function () {
    beforeEach(function () {
        this.modelView = new ViewStructure.ModelView();

        this.removeSpy = sinon.spy(this.modelView, '_removeElement');
        this.destroyStub = sinon.stub();
        this.modelView.on('destroy', this.destroyStub);

        this.modelView.destroy();
        this.modelView.destroy();
    });

    it('should not trigger the destroy event', function () {
        expect(this.destroyStub).to.have.been.calledOnce;
    });

    it('should not remove the view', function () {
        expect(this.removeSpy).to.have.been.calledOnce;
    });

    it('should leave _isDestroyed as true', function () {
        expect(this.modelView).to.be.have.property('_isDestroyed', true);
    });
});

describe('when destroying a collectionModelView', function () {
    beforeEach(function () {
        this.collectionData = [{key1: 'val1'}, {key1: 'val2'}];
        var ModelView = ViewStructure.ModelView.extend({
            template: "<div></div>"
        });
        var CollectionModelView = ViewStructure.CollectionModelView.extend({
            modelView: ModelView
        });
        this.view = new CollectionModelView({
            collection: new Backbone.Collection(this.collectionData)
        });

        this.sinon.spy(this.view, '_removeElement');
        this.sinon.spy(this.view, '_removeChildren');
        this.sinon.spy(this.view, 'closeChildren');
        this.sinon.spy(this.view, 'closeChildView');
        this.sinon.spy(this.view, 'destroy');

        this.onDestroyStub = this.sinon.stub();
        this.view.onDestroy = this.onDestroyStub;

        this.destroyStub = this.sinon.stub();
        this.view.on('destroy', this.destroyStub);

        this.view.render();
        this.view.remove();
    });

    it('should trigger the destroy event', function () {
        expect(this.destroyStub).to.have.been.calledOnce;
    });

    it('should remove the collectionModelView', function () {
        expect(this.view._removeElement).to.have.been.calledOnce;
    });

    it('should remove the collectionModelView children', function () {
        expect(this.view._removeChildren).to.have.been.calledOnce;
    });

    it('should call closeChildren', function () {
        expect(this.view.closeChildren).to.have.been.calledOnce;
    });

    it('should call closeChildView', function () {
        expect(this.view.closeChildView).to.have.been.calledTwice;
    });

    it('should set the collectionModelView _isDestroyed to true', function () {
        expect(this.view).to.be.have.property('_isDestroyed', true);
    });

    it('should set the collectionModelView _isRendered to false', function () {
        expect(this.view).to.be.have.property('_isRendered', false);
    });

    it('should return the View', function () {
        expect(this.view.destroy).to.have.returned(this.view);
    });

    describe('and it has already been destroyed', function () {
        beforeEach(function () {
            this.view.destroy();
            this.view.destroy();
        });

        it('should return the View', function () {
            expect(this.view.destroy).to.have.returned(this.view);
        });

        it('should remove the collectionModelView', function () {
            expect(this.view._removeElement).to.have.been.calledOnce;
        });
    });

    describe('_isDestroyed property', function () {
        beforeEach(function () {
            this.view = new ViewStructure.CollectionModelView();
        });

        it('should be set to false before destroy', function () {
            expect(this.view).to.be.have.property('_isDestroyed', false);
        });

        it('should be set to true after destroying', function () {
            this.view.destroy();
            expect(this.view).to.be.have.property('_isDestroyed', true);
        });
    });
});

//collectionModelView - "add collection event"
describe('when add element to collection in collectionModelView', function () {
    beforeEach(function () {
        this.collectionData = [{key1: 'val1'}];
        this.collection = new Backbone.Collection(this.collectionData);
        var ModelView = ViewStructure.ModelView.extend({
            template: "<div></div>"
        });
        var CollectionModelView = ViewStructure.CollectionModelView.extend({
            modelView: ModelView
        });
        this.view = new CollectionModelView({
            collection: this.collection
        });

        this.sinon.spy(this.view, '_renderModel');
        this.sinon.spy(this.view, 'modelAdded');

        this.modelAddedStub = this.sinon.stub();
        this.view.on('modelAdded', this.modelAddedStub);

        this.view.render();
        this.collection.add({key2: 'val2'});
    });

    it('should trigger the modelAdded event', function () {
        expect(this.modelAddedStub).to.have.been.calledOnce;
    });

    it('should call the _renderModel twice', function () {
        expect(this.view._renderModel).to.have.been.calledTwice;
    });

    it('should  call the modelAdded once', function () {
        expect(this.view.modelAdded).to.have.been.calledOnce;
    });
});

//collectionModelView - "remove collection event"
describe('when remove element from collection in collectionModelView', function () {
    beforeEach(function () {
        this.collectionData = [{key1: 'val1'}, {key2: 'val2'}];
        this.collection = new Backbone.Collection(this.collectionData);
        var ModelView = ViewStructure.ModelView.extend({
            template: "<div></div>"
        });
        var CollectionModelView = ViewStructure.CollectionModelView.extend({
            modelView: ModelView
        });
        this.view = new CollectionModelView({
            collection: this.collection
        });

        this.sinon.spy(this.view, 'closeChildView');
        this.sinon.spy(this.view, 'modelRemoved');

        this.modelRemovedStub = this.sinon.stub();
        this.view.on('modelRemoved', this.modelRemovedStub);

        this.view.render();
        this.collection.remove(this.collection.at(1));
    });

    it('should trigger the modelRemoved event', function () {
        expect(this.modelRemovedStub).to.have.been.calledOnce;
    });

    it('should call the closeChildView once', function () {
        expect(this.view.closeChildView).to.have.been.calledOnce;
    });

    it('should  call the modelRemoved once', function () {
        expect(this.view.modelRemoved).to.have.been.calledOnce;
    });
});

//collectionModelView - "reset collection event"
describe('when reset collection in collectionModelView', function () {
    beforeEach(function () {
        this.collectionData = [{key1: 'val1'}, {key2: 'val2'}];
        this.collection = new Backbone.Collection(this.collectionData);
        var ModelView = ViewStructure.ModelView.extend({
            template: "<div></div>"
        });
        var CollectionModelView = ViewStructure.CollectionModelView.extend({
            modelView: ModelView
        });
        this.view = new CollectionModelView({
            collection: this.collection
        });

        this.sinon.spy(this.view, 'render');
        this.sinon.spy(this.view, '_renderModel');

        this.renderStub = this.sinon.stub();
        this.view.on('render', this.renderStub);

        this.view.render();
        this.collection.reset();
    });

    it('should trigger the render event', function () {
        expect(this.renderStub).to.have.been.calledTwice;
    });

    it('should call the render twice', function () {
        expect(this.view.render).to.have.been.calledTwice;
    });

    it('should  call the _renderModel twice', function () {
        expect(this.view._renderModel).to.have.been.calledTwice;
    });
});

//Initialize default options
describe('constructing a view with default options', function () {
    beforeEach(function () {
        this.pendingModel = {pending: true};
        this.errorModel = {error: true};

        this.ModelView = ViewStructure.ModelView.extend();
    });

    it('should take and store modelView pendingModel', function () {
        this.modelView = new this.ModelView({requestModel: this.pendingModel});
        expect(this.modelView.options.requestModel).to.deep.equal(this.pendingModel);
    });

    it('should have pendingModel undefined by default', function () {
        this.modelView = new this.ModelView();
        expect(this.modelView.options.pendingModel).to.be.undefined;
    });
});

//Testing internal functions
describe('when serializing model', function () {

    beforeEach(function () {
        this.modelDataB = {key: 'value'};
        this.modelB = new Backbone.Model(this.modelDataB);
        this.ViewM = ViewStructure.ModelView.extend({
            template: '<span></span>'
        });

        this.viewM = new this.ViewM({
            model: this.modelB
        });
        //this should be from templateCache
        this.viewM2 = new this.ViewM({
            model: this.modelB
        });
    });

    it('should return all attributes', function () {
        expect(this.viewM.serializeData()).to.be.eql(this.modelDataB);
    });
});

describe('when constructing a modelView with Backbone viewOptions', function () {
    it('should attach the viewOptions to the view if options are on the view', function () {
        this.ModelView = ViewStructure.ModelView.extend({
            className: '.some-class'
        });
        this.modelView = new this.ModelView();
        expect(this.modelView.className).to.equal('.some-class');
    });

    it('should attach the viewOptions to the collectionView', function () {
        this.CollectionView = ViewStructure.CollectionView.extend({
            className: '.some-class'
        });
        this.collectionView = new this.CollectionView();
        expect(this.collectionView.className).to.equal('.some-class');
    });

    it('should attach the viewOptions to the collectionModelView', function () {
        this.CollectionModelView = ViewStructure.CollectionModelView.extend({
            className: '.some-class'
        });
        this.collectionModelView = new this.CollectionModelView();
        expect(this.collectionModelView.className).to.equal('.some-class');
    });

    it('should attach the viewOptions to the layout', function () {
        this.LayoutView = ViewStructure.Layout.extend({
            className: '.some-class'
        });
        this.layoutView = new this.LayoutView();
        expect(this.layoutView.className).to.equal('.some-class');
    });
});

describe('when call onRender/onBeforeRender method', function () {

    beforeEach(function () {
        this.onRenderStub = this.sinon.stub();
        this.onBeforeRenderStub = this.sinon.stub();
        this.modelView = new (ViewStructure.ModelView.extend({
            template: '<div></div>',
            onRender: this.onRenderStub,
            onBeforeRender: this.onBeforeRenderStub
        }));
        this.modelView.render();
    });

    it('should call onRender', function () {
        expect(this.onRenderStub).to.have.been.calledOnce;
    });

    it('should call onBeforeRender', function () {
        expect(this.onBeforeRenderStub).to.have.been.calledOnce;
    });
});

//Rendering
describe('when rendering', function () {
    beforeEach(function () {
        this.modelData = {key1: 'val1'};
        this.collectionData = [{key1: 'val1'}, {key2: 'val2'}];
        this.model = new Backbone.Model(this.modelData);
        this.collection = new Backbone.Collection(this.collectionData);

        this.template = 'template';
        this.templateStub = this.sinon.stub().returns(this.template);
    });

    describe('model state (pending, error, noData)', function() {
        beforeEach(function() {
            before();
            setContent('<div id="content"></div>');
            this.ModelView = ViewStructure.ModelView.extend({
                el: '#content',
                template: "<div id='modelTemplate'><%= key1 %></div>",
                options: {
                    requestTemplate: "<div id='pending'><%= message %></div>",
                    errorTemplate: "<div id='error'><%= message %></div>"
                }
            });
        });
        afterEach(function(){
            after();
        });

        it('should be rendered', function() {
            var modelView = new this.ModelView({
                model: this.model
            });
            modelView.render();
            expect(modelView.isRendered()).to.be.true;
        });

        it('should render pending template in DOM', function() {
            var modelView = new this.ModelView({
                model: this.model,
                requestModel: {message: 'pending'},
                modelEvents: true
            });
            this.model.trigger('request');
            expect(modelView.el.innerHTML).to.contain('<div id="pending">pending</div>');
        });

        it('should not render pending template in DOM, no template', function() {
            var noPendingModelView = new this.ModelView({
                model: this.model,
                modelEvents: true
            });
            this.model.trigger('request');
            expect(noPendingModelView.el.innerHTML).to.contain('');
        });

        it('should render error template in DOM', function() {
            var model = new Backbone.Model(this.modelData);
            var modelView = new this.ModelView({
                model: model,
                errorModel: {message: 'error'},
                modelEvents: true
            });
            model.trigger('error');
            expect(modelView.el.innerHTML).to.contain('<div id="error">error</div>');
        });

        it('should render model template in DOM', function() {
            var ModelView = ViewStructure.ModelView.extend({
                el: '#content',
                template: "<div id='modelTemplate'><%= key1 %></div>",
                options: {
                    requestTemplate: "<div id='pending'><%= message %></div>",
                    errorTemplate: "<div id='error'><%= message %></div>"
                }
            });
            var modelView = new ModelView({
                model: this.model,
                modelEvents: true
            });
            this.model.trigger('sync');
            expect(modelView.el.innerHTML).to.contain('<div id="modelTemplate">val1</div>');
        });


    });

    describe('without valid template', function() {
        beforeEach(function() {
            this.modelView = new ViewStructure.ModelView();
        });

        //TODO: why this test doesn't work
        xit('should set _isRendered to false', function() {
            expect(this.modelView.render).to.throw('Can not render while template is not valid.');
        });
    });

    describe('when instantiating a view with a non existing DOM element', function() {
        beforeEach(function() {
            var ModelView = ViewStructure.ModelView.extend({
                el: '#nonexistent'
            });
            this.modelView = new ModelView();
        });

        it('should not be rendered', function() {
            expect(this.modelView._isRendered).to.be.false;
        });
    });

    describe('when an item view has a model and is rendered', function() {
        beforeEach(function() {
            this.modelView = new (ViewStructure.ModelView.extend({
                template: this.templateStub,
                model: this.model
            }));

            this.serializeDataSpy = this.sinon.spy(this.modelView, 'serializeData');
            this.modelView.render();
        });

        it('should serialize the model', function() {
            expect(this.serializeDataSpy).to.have.been.calledOnce;
        });

        it('should render the template with the serialized model', function() {
            expect(this.templateStub).to.have.been.calledWith(this.modelData);
        });
    });

});

describe('when serializing view data', function() {
    beforeEach(function() {
        this.modelData = {key1: 'val1'};
        this.collectionData = [{key1: 'val1'}, {kay1: 'val2'}];

        this.modelView = new ViewStructure.ModelView();
        this.sinon.spy(this.modelView, 'serializeData');

        this.collectionView = new ViewStructure.CollectionView();
        this.sinon.spy(this.collectionView, 'serializeData');
    });

    it('should return an empty object without data', function() {
        expect(this.modelView.serializeData()).to.deep.equal({});
        expect(this.collectionView.serializeData()).to.deep.equal({});
    });

    describe('and the modelView has a model', function() {
        beforeEach(function() {
            this.modelView.model = new Backbone.Model(this.modelData);
            this.modelView.serializeData();
        });

        it('should call serializeData', function() {
            expect(this.modelView.serializeData).to.have.been.calledOnce;
        });
    });

    describe('and the collectionView has a model', function() {
        beforeEach(function() {
            this.collectionView.model = new Backbone.Collection(this.collectionData);
            this.collectionView.serializeData();
        });

        it('should call serializeData', function() {
            expect(this.collectionView.serializeData).to.have.been.calledOnce;
        });
    });
});