// Create postsDB collection in IndexedDB and posts store
function postsDB() {
  return idb.open("postsDB", 1, upgradeDb => {
    switch (upgradeDb.oldVersion) {
      case 0:
        upgradeDb.createObjectStore("posts", { keyPath: "id" });
    }
  });
}

// Write data to particular store inside postsDB collection of indexedDB
function writeDataToDB(store, data) {
  return postsDB().then(db => {
    let tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(data);
    return tx.complete;
  });
}

// Read data from particular store of postsDB collection
function readDataFromDB(store) {
  return postsDB().then(db => {
    let tx = db.transaction(store, "readonly");
    return tx.objectStore(store).getAll();
  });
}

// Clear particular store from postsDB collection
function clearDB(store) {
  return postsDB().then(db => {
    let tx = db.transaction(store, "readwrite");
    tx.objectStore(store).clear();
    return tx.complete;
  });
}

// Delete single item from store
function deleteItemFromDB(store, itemId) {
  return postsDB().then(db => {
    let tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(itemId);
    return tx.complete;
  });
}
