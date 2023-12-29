const express = require('express');
const logger = require('./logging');
const utils = require('./utils');
const events = require('./events');
const { REQUIRED_PERMISSION, MIN_WAIT_TIME, MAX_WAIT_TIME } = require('./constants');
const { EventType, ErrorType, RequestType } = require('./types');

const app = express();
const updatesApp = express();

updatesApp.use(express.json());
updatesApp.use(express.urlencoded({ extended: true }));

app.get('/getLongPollServer', async (request, response) => {
    const token = request.query.token;

    if (token === undefined) {
        return response.status(400).send(ErrorType.ACCESS_TOKEN_IS_MISSING);
    }

    const result = await utils.checkToken(token);

    if (!result || result < REQUIRED_PERMISSION) {
        return response.status(401).send(ErrorType.NOT_ENOUGH_PERMISSIONS);
    }

    events.emit(EventType.NEW_POLLING_SERVER_REQUEST, result, response);
});

app.get('/:key', (request, response) => {
    const key = request.params.key;
    const ts = request.query.ts || 0;
    let waitTime = request.query.wait || 25;

    logger.info(`ts: ${Number(ts)}`);

    if (isNaN(waitTime) || isNaN(ts)) {
        return response.status(400).send(ErrorType.INVALID_VALUE_TYPE);
    }

    if (waitTime < MIN_WAIT_TIME || waitTime > MAX_WAIT_TIME) {
        return response.status(400).send(ErrorType.INVALID_WAIT_TIME);
    }

    events.emit(EventType.PENDING_SUBSCRIBER, key, Number(waitTime), Number(ts), response);
});

updatesApp.post('/sendUpdate', (request, response) => {
    const requestType = utils.identifyRequestType(request);

    // TODO: This block of code requires tests
    if (requestType === RequestType.FOREIGN) {
        return response.status(404).send(ErrorType.FOREIGN_RESOURCE);
    }

    const update = request.query.update;

    if (!update) {
        return response.status(400).send(ErrorType.UPDATE_OBJECT_IS_MISSING);
    }

    events.emit(EventType.NEW_JEDI_UPDATE, update, response);
});

app.listen(process.env.MAIN_APP_PORT);
updatesApp.listen(process.env.UPDATES_APP_PORT);
