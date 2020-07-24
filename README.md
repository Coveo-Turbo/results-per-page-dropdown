# ResultsPerPageDropdown

The `ResultsPerPageDropdown` component renders a dropdown that the end user can interact with to select the criteria to to choose how many results to display per page.

Disclaimer: This component was built by the community at large and is not an official Coveo JSUI Component. Use this component at your own risk.

## Getting Started

1. Install the component into your project.

```
npm i @coveops/results-per-page-dropdown
```

2. Use the Component or extend it

Typescript:

```javascript
import { ResultsPerPageDropdown, IResultsPerPageDropdownOptions } from '@coveops/results-per-page-dropdown';
```

Javascript

```javascript
const ResultsPerPageDropdown = require('@coveops/results-per-page-dropdown').ResultsPerPageDropdown;
```

3. You can also expose the component alongside other components being built in your project.

```javascript
export * from '@coveops/results-per-page-dropdown'
```

4. Include the component in your template as follows:

Place the component after the last tab in the `coveo-tab-section`

```html
<div class="CoveoResultsPerPageDropdown"></div>
```

## Extending

Extending the component can be done as follows:

```javascript
import { ResultsPerPageDropdown, IResultsPerPageDropdownOptions } from "@coveops/results-per-page-dropdown";

export interface IExtendedResultsPerPageDropdownOptions extends IResultsPerPageDropdownOptions {}

export class ExtendedResultsPerPageDropdown extends ResultsPerPageDropdown {}
```

## Contribute

1. Clone the project
2. Copy `.env.dist` to `.env` and update the COVEO_ORG_ID and COVEO_TOKEN fields in the `.env` file to use your Coveo credentials and SERVER_PORT to configure the port of the sandbox - it will use 8080 by default.
3. Build the code base: `npm run build`
4. Serve the sandbox for live development `npm run serve`