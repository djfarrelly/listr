var app;

app = app || {};

/*
	ideas/todo:
		on window focus pulse new button?
		keypress 'n' for new item
		need auto-resize textareas
		remove always blue on iOS after entering new item
		why padding on left of text areas in list on iOS
		fix scrolling/scrollbars on iOS so you can see the items on the bottom of the screen
*/


$(function($) {
  var List;
  app.Item = Backbone.Model.extend({
    defaults: {
      text: '',
      completed: false
    },
    toggle: function() {
      return this.save({
        completed: !this.get('completed')
      });
    }
  });
  List = Backbone.Collection.extend({
    model: app.Item,
    localStorage: new Store('listr'),
    nextOrder: function() {
      if (!this.length) {
        return 1;
      }
      return this.last().get('order') + 1;
    },
    comparator: function(item) {
      return item.get('order');
    }
  });
  app.List = new List();
  app.ItemView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#item-tmpl').html()),
    events: {
      'dblclick .item': 'toggleCompleted',
      'click .item': 'edit',
      'keypress .edit': 'updateOnEnter',
      'blur .edit': 'close'
    },
    initialize: function() {
      this.model.on('change', this.render, this);
      return this.model.on('destroy', this.remove, this);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('completed', this.model.get('completed'));
      this.input = this.$('.edit');
      return this;
    },
    edit: function() {
      this.$el.addClass('editing');
      return this.input.focus();
    },
    toggleCompleted: function() {
      return this.model.toggle();
    },
    close: function() {
      var val;
      val = this.input.val().trim();
      if (val) {
        this.model.save({
          text: val
        });
      } else {
        this.clear();
      }
      this.$el.removeClass('editing');
      return document.activeElement.blur();
    },
    updateOnEnter: function(e) {
      if (e.which === 13) {
        return this.close();
      }
    },
    clear: function() {
      return this.model.destroy();
    }
  });
  app.ButtonsView = Backbone.View.extend({
    el: '.buttons',
    events: {
      'click .js-new': 'open',
      'keypress .js-new-text': 'saveOnEnter',
      'blur .js-new-text': 'close',
      'keydown': 'keyboardShortcuts'
    },
    initialize: function() {
      this.btnHolder = this.$('.btn-holder');
      return this.input = this.$('.js-new-text');
    },
    open: function() {
      this.btnHolder.addClass('hidden');
      return this.input.removeClass('hidden').focus();
    },
    close: function() {
      this.input.val('').addClass('hidden');
      this.btnHolder.removeClass('hidden');
      return document.activeElement.blur();
    },
    saveOnEnter: function(e) {
      if (e.which !== 13 || !this.input.val().trim()) {
        return;
      }
      app.List.create(app.AppView.newAttr(this.input));
      return this.close();
    },
    keyboardShortcuts: function(e) {
      console.log('keycuts');
      if (e.keyCode === 27) {
        return this.close();
      }
    }
  });
  return app.AppView = Backbone.View.extend({
    el: '.app',
    events: {
      'keypress #js-new-text': 'createOnEnter'
    },
    initialize: function() {
      var buttons;
      this.input = this.$('#js-new-text');
      app.List.on('add', this.addItem, this);
      app.List.on('reset', this.addAll, this);
      app.List.fetch();
      return buttons = new app.ButtonsView();
    },
    addItem: function(item) {
      var view;
      view = new app.ItemView({
        model: item
      });
      return $('#list').append(view.render().el);
    },
    addAll: function() {
      this.$('#list').html('');
      return app.List.each(this.addItem, this);
    },
    newAttr: function(self) {
      return {
        text: self.val().trim(),
        order: app.List.nextOrder(),
        completed: false
      };
    },
    createOnEnter: function(e) {
      if (e.which !== 13 || !this.input.val().trim()) {
        return;
      }
      app.List.create(this.newAttr(this.input));
      return this.input.val('');
    }
  });
});
