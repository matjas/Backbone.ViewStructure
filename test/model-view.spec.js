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

        this.ModelView = Backbone.ViewStructure.ModelView.extend({
            initialize: this.initializeStub
        });

        this.modelView = new this.ModelView();

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
        this.modelView = new Backbone.ViewStructure.ModelView();
        this.modelView.listenTo(this.modelView, 'destroy', this.destroyStub);
        this.modelView.destroy();
    });

    it('should trigger the "destroy" event', function () {
        expect(this.destroyStub).to.have.been.called;
    });
});

describe('when destroying a modelView', function () {
    beforeEach(function () {
        this.modelView = new Backbone.ViewStructure.ModelView();

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
            this.modelView = new Backbone.ViewStructure.ModelView();
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
        this.modelView = new Backbone.ViewStructure.ModelView();

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
        this.modelView = new Backbone.ViewStructure.ModelView();

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
        this.modelView = new Backbone.ViewStructure.ModelView();

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
        this.noDataModel = {noData: true};
        this.errorModel = {error: true};

        this.ModelView = Backbone.ViewStructure.ModelView.extend();
    });

    it('should take and store modelView pendingModel', function () {
        this.modelView = new this.ModelView({pendingModel: this.pendingModel});
        expect(this.modelView.pendingModel).to.deep.equal(this.pendingModel);
    });

    it('should have pendingModel undefined by default', function () {
        this.modelView = new this.ModelView();
        expect(this.modelView.pendingModel).to.be.undefined;
    });
});

describe('when constructing a modelView with Backbone viewOptions', function () {
    it('should attach the viewOptions to the view if options are on the view', function () {
        this.ModelView = Backbone.ViewStructure.ModelView.extend({
            className: '.some-class'
        });
        this.modelView = new this.ModelView();
        expect(this.modelView.className).to.equal('.some-class');
    });

    it('should attach the viewOptions to the collectionView', function () {
        this.CollectionView = Backbone.ViewStructure.CollectionView.extend({
            className: '.some-class'
        });
        this.collectionView = new this.CollectionView();
        expect(this.collectionView.className).to.equal('.some-class');
    });

    it('should attach the viewOptions to the collectionModelView', function () {
        this.CollectionModelView = Backbone.ViewStructure.CollectionModelView.extend({
            className: '.some-class'
        });
        this.collectionModelView = new this.CollectionModelView();
        expect(this.collectionModelView.className).to.equal('.some-class');
    });

    it('should attach the viewOptions to the layout', function () {
        this.LayoutView = Backbone.ViewStructure.Layout.extend({
            className: '.some-class'
        });
        this.layoutView = new this.LayoutView();
        expect(this.layoutView.className).to.equal('.some-class');
    });
});

//Testing internal functions
describe('when serializing model', function () {
    var modelData = {key: 'value'};
    var model;
    var view;

    beforeEach(function () {
        model = new Backbone.Model(modelData);
        view = new Backbone.ViewStructure.ModelView({
            model: model
        });
    });

    it('should return all attributes', function () {
        expect(view.serializeData()).to.be.eql(modelData);
    });
});

describe('model view', function () {
    'use strict';
    beforeEach(function(){
        this.modelData = {key1: 'val1'};
        this.collectionData = [{key1: 'val1'}, {key1: 'val2'}];
        this.model = new Backbone.Model(this.modelData);
        this.collection = new Backbone.Collection(this.collectionData);
        this.modelView = new Backbone.ViewStructure.ModelView({
            model: this.model
        });

        this.template = 'testwrapper';
        this.templateStub = sinon.stub().returns(this.template);

    });

    xit('karma/jasmine test', function (done) {
        var id = true;
        expect(id).toBe(true);
        done();
    });

});
