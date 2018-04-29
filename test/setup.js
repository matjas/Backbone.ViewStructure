export function setup() {

    var $testWrapper;

    function setTestWrapper() {
        _.each(arguments, function(content) {
            $testWrapper.append(content);
        });
    }

    function clearTestWrapper() {
        $testWrapper.empty();
    }

    before(function() {
        $testWrapper = $('<div id="testWrapper">');
        $('body').append($testWrapper);
        this.setTestWrapper = setTestWrapper;
        this.clearTestWrapper = clearTestWrapper;
    });

    beforeEach(function() {
        this.sinon = global.sinon.sandbox.create();
    });

    afterEach(function() {
        this.sinon.restore();
        window.location.hash = '';
        Backbone.history.stop();
        Backbone.history.handlers.length = 0;
        clearTestWrapper();
    });
};
