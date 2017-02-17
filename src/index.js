import m from 'mithril';
import App from './views/_App.js';

window.__DEV__ = window.location.hostname === 'localhost';

m.mount(document.getElementById('app'), App);