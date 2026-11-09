import resolver from './helpers/resolver';
import { setResolver } from '@ember/test-helpers';
import { start } from 'ember-qunit';
// Keep a test entrypoint so ember-auto-import includes the app's npm modules.
import 'remotestoragejs/release/remotestorage.js';

setResolver(resolver);
start();
