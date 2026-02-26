import EventEmitter from "events";

// System-wide event bus for cross-layer communication between the socket and http layers
// In other words, use it to communicate between socket namespaces and http routes.
export const eventBus = new EventEmitter();
