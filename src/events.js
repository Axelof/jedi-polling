const EventEmitter = require('events');
const { EventType, ErrorType } = require("./types");
const logger = require("./logging");
const utils = require("./utils");

const event = new EventEmitter();
const updates = new Map();
const userData = new Map();
const activeConnections = new Map();

const pushNewUpdate = (update) => {
    const currentCount = updates.size;
    updates.set(currentCount + 1, update);
    return currentCount;
};

const incrementTs = (key) => {
    const data = userData.get(key);
    data.ts += 1;
    return data.ts;
};

const getAndDeleteConnection = (key) => {
    const connectionData = activeConnections.get(key);
    activeConnections.delete(key);
    return connectionData;
};

const createAndSaveData = (data) => {
    const hashKey = utils.generateHash();
    const isExisted = removeExistingUserDataById(data.id);

    if (isExisted) {
        logger.debug(`Previous polling data for ${data.id} was deleted`);
    }

    userData.set(hashKey, {
        id: data.id,
        createdAt: utils.getTimestamp(),
        ts: updates.size
    });

    return hashKey;
};

const removeExistingUserDataById = (id) => {
    let isRemoved = false;

    userData.forEach((value, key) => {
        if (value.id === id) {
            isRemoved = true;
            userData.delete(key);
        }
    });

    return isRemoved;
};

const newPollingServerRequest = (data, response) => {
    const key = createAndSaveData(data);
    response.send({ key, ...userData.get(key) });
};

const pendingConnection = (key, waitTime, ts, response) => {
    if (!userData.has(key)) {
        response.status(404).send(ErrorType.INVALID_POLLING_KEY);
        return;
    }

    if (activeConnections.has(key)) {
        activeConnections.delete(key);
    }

    const isPublished = publishUpdate(key, ts, response);

    if (!isPublished) {
        activeConnections.set(key, { response, ts });
        setTimeout(() => {
            if (activeConnections.has(key)) {
                const data = getAndDeleteConnection(key);
                response.send({ ts: data.ts });
            }
        }, waitTime * 1000);
    }
};

const publishUpdate = (key, ts, response) => {
    const update = updates.get(ts + 1);

    if (!update) {
        return false;
    }

    const incrementedTs = incrementTs(key);
    response.send({ ts: incrementedTs, updates: update });
    return true;
};

const newJediUpdate = (updateObject, response) => {
    pushNewUpdate(updateObject);

    activeConnections.forEach((data, hashKey) => {
        publishUpdate(hashKey, data.ts, data.response);
        activeConnections.delete(hashKey);
    });

    response.send({ response: { ok: 1 } });
};

event.on(EventType.NEW_POLLING_SERVER_REQUEST, newPollingServerRequest);
event.on(EventType.PENDING_SUBSCRIBER, pendingConnection);
event.on(EventType.NEW_JEDI_UPDATE, newJediUpdate);

module.exports = event;
