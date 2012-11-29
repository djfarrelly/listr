var db, dbName, dbVer, indexedDB, renderItem;

dbName = 'Listr';

dbVer = '1.0';

db = {};

indexedDB = window.indexedDB;

db.indexedDB = {};

db.indexedDB.db = null;

db.indexedDB.open = function() {
  var request;
  request = indexedDB.open(dbName, dbVer);
  request.onsuccess = function(e) {
    var req, temp;
    console.log("DB opened: ", dbName);
    db.indexedDB.db = e.target.result;
    temp = db.indexedDB.db;
    if (temp.setVersion) {
      console.log("setVersion: ", temp.setVersion);
      if (temp.version !== dbVer) {
        req = temp.setVersion(dbVer);
        return req.onsuccess = function() {
          var store, trans;
          if (temp.objectStoreNames.contains('item')) {
            temp.deleteObjectStore('item');
          }
          store = temp.createObjectStore('item', {
            keyPath: 'timeStamp'
          });
          trans = req.result;
          return trans.oncomplete = function(e) {
            console.log("transfer complete");
            return db.indexedDB.getAllItems();
          };
        };
      } else {
        return db.indexedDB.getAllItems();
      }
    } else {
      return db.indexedDB.getAllItems();
    }
  };
  request.onupgradeneeded = function(e) {
    var temp;
    console.log("Upgrading the DB");
    db.indexedDB.db = e.target.result;
    return temp = db.indexedDB.db;
  };
  request.onfailure = db.indexedDB.onerror;
  return request.onerror = function(e) {
    return console.error("Error: ", e);
  };
};

db.indexedDB.addItem = function(text) {
  var data, request, store, temp, trans;
  temp = db.indexedDB.db;
  trans = temp.transaction(['item'], 'readwrite');
  store = trans.objectStore('item');
  data = {
    'text': text,
    'timestamp': new Date().getTime()
  };
  request = store.put(data);
  request.onsuccess = function(e) {
    return db.indexedDB.getAllItems();
  };
  return request.onerror = function(e) {
    return console.error("Error adding item: ", e);
  };
};

db.indexedDB.getAllItems = function() {
  var cursorRequest, items, keyRange, store, temp, trans;
  items = document.getElementById('list');
  items.innerHTML = "";
  temp = db.indexedDB.db;
  trans = temp.transaction(['item'], 'readwrite');
  store = trans.objectStore('item');
  keyRange = IDBKeyRange.lowerBound(0);
  cursorRequest = store.openCursor(keyRange);
  cursorRequest.onsuccess = function(e) {
    var result;
    result = e.target.result;
    if (!!result === false) {
      return;
    }
    renderItem(result.value);
    return result["continue"]();
  };
  return cursorRequest.onerror = db.indexedDB.onerror;
};

renderItem = function(item) {
  var items, li, t;
  items = document.getElementById('list');
  li = document.createElement('li');
  t = document.createTextNode(item.text);
  li.appendChild(t);
  return items.appendChild(li);
};

window.db = db;
