//import {setup} from './setup';
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

    it('karma/jasmine test', function (done) {
        var id = true;
        expect(id).toBe(true);
        done();
    });

});
