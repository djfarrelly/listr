app = app || {}
# Listr 0.1 - DJF
###
	ideas/todo:
		on window focus pulse new button?
		keypress 'n' for new item
		need auto-resize textareas
		remove always blue on iOS after entering new item
		why padding on left of text areas in list on iOS
		fix scrolling/scrollbars on iOS so you can see the items on the bottom of the screen

###
$(($) ->

	# Model
	app.Item = Backbone.Model.extend(
		defaults:
			text: ''
			completed: false
		toggle: ->
			@save(
				completed: !@get('completed')
				)
		)

	# Collection
	List = Backbone.Collection.extend(
		model: app.Item
		localStorage: new Store('listr')
		nextOrder: ->
			if !this.length
				return 1
			return @.last().get('order') + 1
		comparator: (item) ->
			return item.get('order')
		)
	app.List = new List()

	# Item view
	app.ItemView = Backbone.View.extend(
		tagName: 'li'
		template: _.template($('#item-tmpl').html())
		events:
			'dblclick .item':	'toggleCompleted'
			'click .item':  	'edit'
			'keypress .edit':	'updateOnEnter'
			'blur .edit':		'close'
			# Add .destroy: 'clear'


		initialize: ->
			@model.on('change', @render, this)
			@model.on('destroy', @remove, this)

		render: ->
			@$el.html( @template( this.model.toJSON() ) )
			@$el.toggleClass('completed', @model.get('completed'))

			@input = this.$('.edit')
			return this

		edit: ->
			@$el.addClass('editing')
			@input.focus()

		toggleCompleted: ->
			@model.toggle()

		close: ->
			val = @input.val().trim()
			if val
				@model.save({ text: val })
			else
				@clear()
			@$el.removeClass('editing')
			# To close keyboard on iOS => Possibly a more elegant solution
			document.activeElement.blur()

		updateOnEnter: (e) ->
			if e.which is 13
				@close()

		clear: ->
			@model.destroy()

		)

	# the application buttons
	app.ButtonsView = Backbone.View.extend(
		el: '.buttons'

		events:
			'click .js-new':			'open'
			'keypress .js-new-text':	'saveOnEnter'
			'blur .js-new-text':		'close'
			'keydown':					'keyboardShortcuts'

		initialize: ->
			@btnHolder = this.$('.btn-holder')
			@input = this.$('.js-new-text')

		open: ->
			@btnHolder.addClass('hidden')
			@input.removeClass('hidden').focus()

		close: ->
			@input.val('').addClass('hidden')
			@btnHolder.removeClass('hidden')
			# To close keyboard on iOS => Possibly a more elegant solution
			document.activeElement.blur()

		saveOnEnter: (e) ->
			if e.which isnt 13 or not @input.val().trim()
				return
			app.List.create( app.AppView.newAttr(@input) )
			@close()

		keyboardShortcuts: (e) ->
			console.log('keycuts')
			if e.keyCode is 27
				@close()

		)

	# App view
	app.AppView = Backbone.View.extend(
		el: '.app'
		events:
			'keypress #js-new-text': 'createOnEnter'
			# 'click #new': 'create'

		initialize: ->
			@input = this.$('#js-new-text')

			app.List.on('add', @addItem, this)
			app.List.on('reset', @addAll, this)

			app.List.fetch()

			buttons = new app.ButtonsView()

		addItem: (item) ->
			view = new app.ItemView({ model: item })
			$('#list').append( view.render().el )

		addAll: ->
			this.$('#list').html('')
			app.List.each(@addItem, this)

		newAttr: (self) ->
			return {
				text: self.val().trim()
				order: app.List.nextOrder()
				completed: false
			}

		createOnEnter: (e) ->
			if e.which isnt 13 or not @input.val().trim()
				return
			app.List.create( @newAttr(@input) )
			@input.val('')

		)


)