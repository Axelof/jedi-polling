module.exports.ErrorType = {
    ACCESS_TOKEN_IS_MISSING: {
        error_code: 1,
        error: 'Access token has not been specified'
    },
    NOT_ENOUGH_PERMISSIONS: {
        error_code: 2,
        error: 'Access token has not enough permissions'
    },
    INVALID_POLLING_KEY: {
        error_code: 3,
        error: 'Provided key is expired or does not exist'
    },
    INVALID_WAIT_TIME: {
        error_code: 4,
        error: 'Provided improper wait time, should be between 25 and 90'
    },
    FOREIGN_RESOURCE: {
        error_code: 5,
        error: 'Connections from foreign resources are not allowed'
    },
    UPDATE_OBJECT_IS_MISSING: {
        error_code: 6,
        error: 'Update object is missing or invalid'
    },
    INVALID_VALUE_TYPE: {
        error_code: 7,
        error: 'Value must be an integer'
    }
};

module.exports.EventType = {
    NEW_POLLING_SERVER_REQUEST: "new_polling_server_request",
    PENDING_SUBSCRIBER: "pending_subscriber",
    NEW_JEDI_UPDATE: "new_jedi_update"
};

module.exports.RequestType = {
    LOCAL: "localhost",
    FOREIGN: "foreign"
};

module.exports.EnvironmentType = {
    PRODUCTION: "prod",
    DEVELOPMENT: "dev"
};

module.exports.LoggingLevel = {
    DEBUG: 'debug',
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    FATAL: 'fatal',
    CRITICAL: 'critical'
};
