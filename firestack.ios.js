/**
 * @providesModule Firestack
 * @flow
 */
const FirebaseManager = require('firebase');

const app = require('firebase/app');
const db = require('firebase/database');
const storage = require('firebase/storage');

import {NativeModules, NativeAppEventEmitter} from 'react-native';
const FirebaseHelper = NativeModules.Firestack;

const promisify = fn => (...args) => {
  return new Promise((resolve, reject) => {
    const handler = (err, resp) => err ? reject(err) : resolve(resp);
    args.push(handler);
    FirebaseHelper[fn].call(FirebaseHelper, ...args);
  });
};

export default class Firestack {
  constructor(options) {
    this.options = options;
    this.appInstance = app.initializeApp(options);
    this.configured = false;

    this.eventHandlers = {};
  }

  configure() {
    return promisify('configure')()
    .then((...args) => {
      this.configured = true;
      return args;
    });
  }

  // Auth
  listenForAuth(callback) {
    const sub = this.on('listenForAuth', callback);
    FirebaseHelper.listenForAuth();
    return sub;
  }

  unlistenForAuth() {
    this.off('listenForAuth');
    return promisify('unlistenForAuth')();
  }

  createUserWithEmail(email, password) {
    return promisify('createUserWithEmail')(email, password);
  }

  signInWithEmail(email, password) {
    return promisify('signInWithEmail')(email, password);
  }

  signInWithProvider(provider, authToken, authSecret) {
    return promisify('signInWithProvider')(provider, authToken, authSecret);
  }

  signOut() {
    return promisify('signOut')();
  }

  getCurrentUser() {
    return promisify('getCurrentUser')();
  }

  // Analytics
  logEventWithName(name, props) {
    return promisify('logEventWithName')(name, props);
  }

  // Storage
  setStorageUrl(url) {
    return promisify('setStorageUrl')(url);
  }

  uploadFile(name, filepath, metadata) {
    return promisify('uploadFile')(name, filepath, metadata);
  }

  // database
  get database() {
    return db();
  }

  get storage() {
    return storage();
  }

  // other
  get ServerValue() {
    return db.ServerValue;
  }

  on(name, cb) {
    if (!this.eventHandlers[name]) {
      this.eventHandlers[name] = [];
    }
    const sub = NativeAppEventEmitter.addListener(name, cb);
    this.eventHandlers[name].push(sub);
    return sub;
  }

  off(name) {
    if (this.eventHandlers[name]) {
      this.eventHandlers.forEach(subscription => subscription.remove());
    }
  }

}
