# cameraviewer-api

This is the source of information for https://github.com/dervondenbergen/cameraviewer

All Data is not self collected but from https://www.dpreview.com/products/cameras

## Setup

Data is saved in a postgres DB. To set it up create a DB called `cameraviewer`. Then run `node setupDB.js` to create the tables.

Actual Data gets saved by visiting the endpoint `/update/brand`, `/update/camera`, `/update/lens` in given order.

## Usage

### locally

````sh
npm install
npm start
````

### online (recommended)

Easier to use if the API is accessible online.

The API can be started simply on heroku like this: https://github.com/heroku/node-js-getting-started#deploying-to-heroku
