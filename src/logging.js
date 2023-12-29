const pino = require('pino');
const { EnvironmentType, LoggingLevel } = require('./types');

const identifyLoggingLevel = () => {
    const nodeEnv = process.env.NODE_ENV || EnvironmentType.DEVELOPMENT;

    return nodeEnv === EnvironmentType.DEVELOPMENT ? LoggingLevel.DEBUG : LoggingLevel.INFO;
};

const options = { mkdir: true, colorize: false, ignore: 'pid,hostname' };
const logger = pino({
    transport: {
        targets: [
            {
                target: 'pino-pretty',
                options: { ...options, destination: 'logs/debug.log' },
                level: 'debug'
            },
            {
                target: 'pino-pretty',
                options: { ...options, destination: 'logs/errors.log' },
                level: 'error'
            },
            {
                target: 'pino-pretty',
                options: { ignore: 'pid,hostname', translateTime: 'SYS:standard' },
                level: 'debug'
            }
        ],
    },
    level: identifyLoggingLevel()
})

module.exports = logger;
