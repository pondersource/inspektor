# RS Inspektor

Inspektor is a simple file browser for inspecting the contents of a
[remoteStorage](https://remotestorage.io) account. It is intended for RS app
developers and power users.

You're invited to contribute to this app and/or submit feedback to improve it. Please use the
[RS Discourse forums](https://community.remotestorage.io/t/rs-inspektor-a-simple-remotestorage-file-browser/428)
to post issues or ideas, and/or to request an account for gitea.kosmos.org
if you want to submit pull requests directly to the upstream repository. You
may also submit Git patches via [e-mail](mailto:raucao@kip.pe).

## Features

* [x] Connect RS accounts
* [x] Traverse/inspect directories
* [x] View document details
* [x] Render images in details
* [x] Render text content in details
* [x] Render JSON content tree view (optional source view)
* [x] Delete documents
* [x] Edit JSON content in tree view
* [x] Delete directories
* [ ] Edit content source
* [ ] Render other types of content (e.g. audio and video)
* [ ] Copy/move documents
* [ ] Copy/move directories (and enclosed files)
* [ ] Loading indicator for any view change that loads remote data
* [ ] Logo/icon
* [ ] Layout/support for small screens

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with NPM)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)

## Installation

* `git clone <repository-url>` this repository
* `cd inspektor`
* `npm install`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

With the 5apps remote added correctly (and push access to the GitLab repo),
just run:

    npm run deploy

If you want to deploy this from and to different repos, have a look at the
`scripts` section in `package.json`, as well as `scripts/deploy.sh` for how it
works.

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
