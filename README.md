# Fresh Approach Mapping

## About

This is a prototype React app using [react leaflet](https://react-leaflet.js.org/) to display food distribution data using [Netlify Functions](https://www.netlify.com/products/functions/)

## Getting Started as a Collaborator

1. run `nvm use`
2. run `yarn`
3. set up the environment variables
4. run `netlify login` and verify your account
5. check that the administrator has added you to the netifly account using your email accessed when logging in
6. run `yarn netlify link`

## Running the app in develop mode using VS Code

1. In VS Code, select the debugger button on the left-hand menu
2. press the play triangle in the top bar
3. wait for a browser page to open

## Setting up a new project

If you would like to fork this repo and start your own spreadsheet setup. You will need to set two specific environment variables. They are `GOOGLE_CLIENT_ID` and `SPREADSHEET_ID`.

### Client ID

The Client ID can be found in the google developer console.

1. Setup and google cloud account, ideally tied to your gmail or some other google workspace account.
2. Navigate to `/apis/credentials` and click `+ Create Credentials`, then `Oauth Client ID`
3. For application type, choose `Web Application`
4. Set your Authorized Javascript Origins, for local development this may be `http://localhost:8888`, the url for your deployed code will need to be set too (eg. something like `https://fresh-approach.netlify.app`).
5. Set your Authorized Redirects, for local development this may be `http://localhost:8888/redirect`.

### Spreadsheet ID

The spreadsheet ID can be found in the url for the spreadsheet that you are accessing for your data.
It is:

```
https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit#gid=<SOME_OTHER_ID>
```

A template for the spreadsheet is available here:
`https://docs.google.com/spreadsheets/d/1bboLpsDu0I8MkYON5ri39arQlW8HkN-kqbnL7oRq3C4/edit#gid=0`

To create your own food distribution map with your own data, go to File, select `Make a Copy` of the spreadsheet, and start filling in your own locations, distributions and purchases.

Finally, if you need any help getting up and running, please reach out to `@higgyCodes` on Github or Twitter.
