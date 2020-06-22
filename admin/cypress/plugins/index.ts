/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

/**
 * This function is called when a project is opened or re-opened (e.g. due to
 * the project's config changing)
 * @type {Cypress.PluginConfig}
 */
export default (on: any /*, config: any */) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  on('before:browser:launch', (browser: any = {}, launchOptions: any) => {
    if (browser.family === 'chromium' && browser.name !== 'electron') {
      // Mac/Linux
      launchOptions.args.push('--use-file-for-fake-video-capture=cypress/fixtures/qr_code_ud.y4m');

      // Windows
      // launchOptions.args.push('--use-file-for-fake-video-capture=c:\\path\\to\\video\\qr_code_ud.y4m')
    }

    return launchOptions;
  });
};
