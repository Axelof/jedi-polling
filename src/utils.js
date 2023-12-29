const crypto = require('crypto');
const axios = require('axios');
const { API_URL, LOCALHOST_VARIABLES } = require('./constants');
const { RequestType } = require('./types');
const logger = require('./logging');

module.exports.getTimestamp = () => {
    return Math.floor(Date.now() / 1000);
};

module.exports.generateHash = (length = 8) => {
    const result = crypto.randomUUID();
    return result.substring(0, length);
};

module.exports.checkToken = async token => {
    const url = `${API_URL}/session.get`;

    try {
        const response = await axios.post(url, new URLSearchParams({ 'access_token': token }));
        return response.data.response || false;
    } catch (error) {
        logger.error(`Error during token verification: ${error.message}`);
        return false;
    }
};

module.exports.identifyRequestType = (request) => {
    const remoteAddress = request.socket.remoteAddress;

    return LOCALHOST_VARIABLES.includes(remoteAddress) ? RequestType.LOCAL : RequestType.FOREIGN;
};