// load type definitions that come with Cypress module
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login in the admin.
     */
    loginWithUI(email: string, password: string): void;

    /**
     * Login and save the user data to the local storage
     *
     * This can be used at the start of a group of teste and retore the loggin
     * data with `` before each test
     */
    loginAndSaveStorage(email: string, password: string): void;

    /**
     * Create a benefit with name, date and value
     */
    createBenefit(name: string, date: string, value: string): void;
    /**
     * Delete a benefit by its name
     */
    deleteBenefit(name: string): void;

    /**
     * Get family balance using the ui
     */
    getFamilyBalance(nis: string, callback?: (value: string) => void): void;
  }
}
