import { createLogger, format, transports } from 'winston'
// const { combine, prettyPrint, timestamp } = format
const { combine, timestamp, label, prettyPrint, json } = format

format.time
export default createLogger({
  format: combine(prettyPrint(), timestamp(), json()),
  transports: [
    // new transports.Console({ level: 'debug' }),
    new transports.File({ filename: 'log_error.log', level: 'error' }),
    new transports.File({ filename: 'log_info.log', level: 'info' }),
  ],
})
