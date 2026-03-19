const EventEmitter = require("events")
const locitraEvents = new EventEmitter()

// Log all emitted events in development
if (process.env.NODE_ENV !== "production") {
    const originalEmit = locitraEvents.emit;
    locitraEvents.emit = function (event, ...args) {
        console.log(`[Event Emitted] ${event}`);
        return originalEmit.apply(locitraEvents, [event, ...args]);
    };
}

module.exports = locitraEvents
