'use strict';

/*
* Github example: https://github.com/rsmbl/Resemble.js#example
* Js frontend example: https://rsmbl.github.io/Resemble.js/demoassets/main.js
*/
const outputSettings = {
    errorType: 'movementDifferenceIntensity',
    transparency: 0.3,
    outputDiff: true,
    useCrossOrigin: false
};

const diffBasePath = './screenshots/diff/';

module.exports = {
    outputSettings,
    diffBasePath
};
