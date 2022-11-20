import * as idb from 'idb';

let isExisting = (await window.indexedDB.databases()).map(db => db.name).includes('test');
if (isExisting) {
    await idb.deleteDB('test');
    isExisting = false;
    console.log('remove test db');
}

const dbPromise = idb.openDB('test', 1, {
    upgrade(database, oldVersion, newVersion, transaction, event) {
        console.log('create the test db');
        if(!database.objectStoreNames.contains('people')) {
            const peopleOS = database.createObjectStore('people', { keyPath: 'email'});
            peopleOS.createIndex('name', 'name', { unique: false });
        }
        if (!database.objectStoreNames.contains('notes')) {
            const notesOS = database.createObjectStore('notes', { autoIncrement: true });
            notesOS.createIndex('title', 'title', { unique: false });
        }
        if (!database.objectStoreNames.contains('logs')) {
            const logsOS = database.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
        }
    }
});

dbPromise.then(db => {
    const tx = db.transaction('people', 'readwrite');
    const store = tx.objectStore('people');
    const item = {
        name: 'HunterKo',
        email: 'zoopk03@gmail.com'
    };
    const item2 = {
        name: 'HunterKo',
        email: 'zoopk02@gmail.com'
    };
    store.add(item);
    store.add(item2)
    return tx.done;
}).then(function () {
    console.log('Added item to the store!');
});

dbPromise.then((db) => {
    const tx = db.transaction(['people', 'notes'], 'readonly');
    const store = tx.objectStore('people');
    return store.get('zoopk03@gmail.com');
}).then((val) => {
    console.dir(val);
})

dbPromise
    .then(function (db) {
        const tx = db.transaction('people', 'readwrite');
        const store = tx.objectStore('people');
        const item = {
            name: 'HunterKo',
            email: 'zoopk03@gmail.com'
        };
        store.put(item);
        return tx.done;
    })
    .then(function () {
        console.log('Item updated!');
    });

dbPromise.then((db) => {
    const tx = db.transaction(['people', 'notes'], 'readonly');
    const store = tx.objectStore('people');
    return store.get('zoopk03@gmail.com');
}).then((val) => {
    console.dir(val);
})

dbPromise.then((db) => {
    const tx = db.transaction(['people', 'notes'], 'readonly');
    const store = tx.objectStore('people');
    const index = store.index('name');
    return store.getAll();
}).then((val) => {
    console.dir(val);
})

dbPromise
    .then(function (db) {
        const tx = db.transaction('people', 'readonly');
        const store = tx.objectStore('people');
        return store.openCursor();
    })
    .then(function logItems(cursor) {
        if (!cursor) {
            return;
        }
        console.log('Cursored at:', cursor.key);
        for (const field in cursor.value) {
            console.log(cursor.value[field]);
        }
        return cursor.continue().then(logItems);
    })
    .then(function () {
        console.log('Done cursoring.');
    });