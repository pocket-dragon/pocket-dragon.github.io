import LocalForage from 'localforage';

export default class Storage {
    public dbPromise;

    constructor() {
        this.dbPromise = new Promise((resolve, reject) => {
            let db;

            const config = {
                name: '_cryptostorage',
                storeName: '_cryptokv',
                driverOrder: ['indexeddb', 'websql', 'localstorage'],
            };

            db = LocalForage.createInstance(config);
            db.setDriver(this.getDriverOrder(config.driverOrder))
                .then(() => {
                    resolve(db);
                })
                .catch(reason => reject(reason));
        });
    }

    public ready() {
        return this.dbPromise;
    }

    public getDriverOrder(driverOrder) {
        return driverOrder.map(driver => {
            switch (driver) {
                case 'indexeddb':
                    return LocalForage.INDEXEDDB;
                case 'websql':
                    return LocalForage.WEBSQL;
                case 'localstorage':
                    return LocalForage.LOCALSTORAGE;
                default:
                // No default
            }
        });
    }

    public get(key) {
        return this.dbPromise.then(db => {
            return db.getItem(key);
        });
    }

    public set(key, value) {
        return this.dbPromise.then(db => {
            return db.setItem(key, value);
        });
    }

    public remove(key) {
        return this.dbPromise.then(db => {
            return db.removeItem(key);
        });
    }

    public clear() {
        return this.dbPromise.then(db => {
            return db.clear();
        });
    }
}
