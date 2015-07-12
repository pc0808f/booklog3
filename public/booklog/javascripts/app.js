/**
* SETUP
**/
var app = app || {};


/**
* MODELS
**/
app.Message = Backbone.Model.extend({
    url: function() {
         return 'http://localhost:3000/1/post';
    },
    defaults: {
    }
});

/**
* VIEWS
**/
app.ContentView = Backbone.View.extend({
    el: '#content',
    template: _.template($('#postTemplate').html()),
    // constructor
    initialize: function() {
        this.model = new app.Message();
        this.model.bind('change', this.render, this);
        
        this.model.fetch();
    },
    render: function() {
        var html = this.template(this.model.attributes);
        this.$el.html(html);
    },
});

$(document).ready(function(){
    app.contentView = new app.ContentView();
});
