/*global PreLinked, Backbone, JST*/

PreLinked.Views.SearchfilterView = Backbone.View.extend({

  template: JST['app/scripts/templates/searchFilter.hbs'],

  render: function () {
    this.$el.append( this.template(this.model.attributes) );
    return this;
  }

});