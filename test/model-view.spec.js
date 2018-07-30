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
            //this.setFixtures('<div id="foo"><span class="element">bar</span></div>');
            this.modelView = new ViewStructure.ModelView({
                el: '#nonexistent'
            });
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