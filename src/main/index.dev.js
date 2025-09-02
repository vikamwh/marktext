/**
 * This file is used specifically and only for development. It installs
 * `vue-devtools`. There shouldn't be any need to modify this file,
 * but it can be used to extend your development environment.
 */

/* eslint-disable */
require('dotenv').config()

// Install `vue-devtools` (optional). Enable by setting ENABLE_VUE_DEVTOOLS=1.
require('electron').app.on('ready', () => {
  if (process.env.ENABLE_VUE_DEVTOOLS === '1') {
    const { default: installExtension, VUEJS_DEVTOOLS } = require('electron-devtools-installer')
    installExtension(VUEJS_DEVTOOLS)
      .then(() => {})
      .catch(() => { /* ignore devtools install errors in dev */ })
  }
})

/* eslint-enable */

// Require `main` process to boot app
require('./index')
