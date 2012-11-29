dbName = 'Listr'
dbVer = '1.0'
db = {}
indexedDB = window.indexedDB
db.indexedDB = {}
db.indexedDB.db = null

# Working from tutorial at:
# http://greenido.wordpress.com/2012/10/05/how-to-use-indexeddb-simplest-example/

db.indexedDB.open = ->
	request = indexedDB.open(dbName, dbVer)

	request.onsuccess = (e) ->
		console.log "DB opened: ", dbName
		db.indexedDB.db = e.target.result
		# set version is deprecated!
		temp = db.indexedDB.db
		if temp.setVersion
			console.log "setVersion: ", temp.setVersion
			if temp.version isnt dbVer
				req = temp.setVersion(dbVer)
				req.onsuccess = ->
					if temp.objectStoreNames.contains('item')
						temp.deleteObjectStore('item')
					store = temp.createObjectStore('item', {
						keyPath: 'timeStamp'
						})
					trans = req.result
					trans.oncomplete = (e) ->
						console.log "transfer complete"
						db.indexedDB.getAllItems()
			else
				db.indexedDB.getAllItems()
		else
			db.indexedDB.getAllItems()

	# Not currently doing anything
	request.onupgradeneeded = (e) ->
		console.log "Upgrading the DB"
		db.indexedDB.db = e.target.result
		temp = db.indexedDB.db
		# ...

	request.onfailure = db.indexedDB.onerror
	request.onerror = (e) ->
		console.error "Error: ", e

db.indexedDB.addItem = (text) ->
	temp = db.indexedDB.db
	trans = temp.transaction ['item'], 'readwrite'
	store = trans.objectStore 'item'

	data =
		'text': text
		'timestamp': new Date().getTime()
	request = store.put(data)
	request.onsuccess = (e) ->
		db.indexedDB.getAllItems()
	request.onerror = (e) ->
		console.error "Error adding item: ", e



db.indexedDB.getAllItems = ->
	items = document.getElementById('list')
	items.innerHTML = ""
	temp = db.indexedDB.db
	trans = temp.transaction ['item'], 'readwrite'
	store = trans.objectStore 'item'

	# Get everything in the store
	keyRange = IDBKeyRange.lowerBound(0)
	cursorRequest = store.openCursor keyRange

	cursorRequest.onsuccess = (e) ->
		result = e.target.result
		if !!result is false
			return

		renderItem result.value
		result.continue()
	cursorRequest.onerror = db.indexedDB.onerror


renderItem = (item) ->
	items = document.getElementById 'list'
	li = document.createElement 'li'
	t = document.createTextNode item.text

	li.appendChild t
	items.appendChild li


# Expose to window
window.db = db
