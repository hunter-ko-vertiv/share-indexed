import * as idb from 'idb';

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
        if (!database.objectStoreNames.contains('store')) {
            const storeOS = database.createObjectStore('store', { keyPath: 'name', autoIncrement: true });
            storeOS.createIndex('price', 'price', { unique: false });
            storeOS.createIndex('description', 'description',{ unique: false });
            storeOS.createIndex('created', 'created',{ unique: false });
        }
    }
});

await dbPromise
    .then( (db) => {
        const tx = db.transaction('store', 'readwrite');
        const store = tx.objectStore('store');
        const item = {
            name: 'sandwich',
            price: 4.99,
            description: 'A very tasty sandwich',
            created: new Date().getTime(),
        };
        store.put(item);
        return tx.done;
    })



await dbPromise
    .then(function (db) {
        const tx = db.transaction('store', 'readonly');
        const store = tx.objectStore('store');
        return store.get('sandwich');
    })
    .then(function (val) {
        console.dir(val);
    });


await dbPromise
    .then(function (db) {
        const tx = db.transaction('store', 'readwrite');
        const store = tx.objectStore('store');
        const item = {
            name: 'sandwich',
            price: 99.99,
            description: 'A very tasty, but quite expensive, sandwich',
            created: new Date().getTime(),
        };
        store.put(item);
        return tx.done;
    })
    .then(function () {
        console.log('Item updated!');
    });


await dbPromise
    .then(function (db) {
        const tx = db.transaction('store', 'readonly');
        const store = tx.objectStore('store');
        return store.get('sandwich');
    })
    .then(function (val) {
        console.dir(val);
    });

await dbPromise
    .then(function (db) {
        const tx = db.transaction('store', 'readwrite');
        const store = tx.objectStore('store');
        store.delete('sandwich');
        return tx.done;
    })
    .then(function () {
        console.log('Item deleted.');
    });

await dbPromise
    .then(function (db) {
        const tx = db.transaction('store', 'readonly');
        const store = tx.objectStore('store');
        return store.get('sandwich');
    })
    .then(function (val) {
        console.dir(val);
    });


await dbPromise
    .then(function (db) {
        const tx = db.transaction('store', 'readwrite');
        const store = tx.objectStore('store');
        const item1 = {
            name: 'sandwich',
            price: 99.99,
            description: 'A very tasty, but quite expensive, sandwich',
            created: new Date().getTime(),
        }
        const item2 = {
            name: 'hotdog',
            price: 49.99,
            description: 'A very tasty, but quite expensive, hotdog',
            created: new Date().getTime(),
        }
        const item3 = {
            name: 'chicken',
            price: 99.99,
            description: 'A very tasty, but quite expensive, chicken',
            created: new Date().getTime(),
        }
        const item4 = {
            name: 'roaster',
            price: 69.99,
            description: 'A very tasty, but quite expensive, rpaster',
            created: new Date().getTime(),
        }
        store.put(item1);
        store.put(item2);
        store.put(item3);
        store.put(item4);
        return tx.done;
    })
    .then(function () {
        console.log('Item updated!');
    });




await dbPromise
    .then(function (db) {
        const tx = db.transaction('store', 'readonly');
        const store = tx.objectStore('store');
        return store.getAll();
    })
    .then(function (items) {
        console.log('Items by name:', items);
    });


await dbPromise
    .then(function (db) {
        const tx = db.transaction('store', 'readonly');
        const store = tx.objectStore('store');
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




await searchItems(1, 60);

function searchItems(lower, upper) {
    if (lower === '' && upper === '') {
        return;
    }

    let range;
    if (lower !== '' && upper !== '') {
        range = IDBKeyRange.bound(lower, upper);
    } else if (lower === '') {
        range = IDBKeyRange.upperBound(upper);
    } else {
        range = IDBKeyRange.lowerBound(lower);
    }

    dbPromise
        .then(function (db) {
            const tx = db.transaction(['store'], 'readonly');
            const store = tx.objectStore('store');
            const index = store.index('price');
            return index.openCursor(range);
        })
        .then(function showRange(cursor) {
            if (!cursor) {
                return;
            }
            console.log('======================================================= cursor with bound =============================================')
            console.log('Cursored at:', cursor.key);
            for (const field in cursor.value) {
                console.log(cursor.value[field]);
            }
            return cursor.continue().then(showRange);
        })
        .then(function () {
            console.log('Done cursoring.');
        });
}