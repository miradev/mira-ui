# Mira UI

The local user interface for Mira-based smart mirror systems.

This is a minimal Electron application (JavaScript) that is capable of loading widget packages on runtime.

## Development

Use of [Visual Studio Code](https://code.visualstudio.com/) and [yarn package manager](https://yarnpkg.com/) to develop this project is strongly recommended.

Clone and install dependencies.

```
git clone git@github.com:miradev/mira-ui.git
cd mira-ui

yarn install
```

Build Mira UI locally (creates files in a `./dist/` folder).

```
yarn build
```

Start local development application after building.

```
yarn start
```

Package as a single Electron application when done.

```
yarn package
```

## Widgets

Mira UI has a widget plugin system that allows "widget packages" bundled in a single `.zip` file to be loaded on runtime. These zip files are similar to Chrome Extensions in nature, and require a `manifest.json` to be defined. On runtime, the zip is decompressed onto the filesystem within the appropriate "widgets" folder and is loaded by the application.

The `manifest.json` file defines a JavaScript entrypoint which is loaded on runtime. This JavaScript entrypoint file must have a [subclass of Widget](https://github.com/miradev/mira-ui/blob/master/src/widgets/widget.ts) defined as the default export.

For example, a zipped widget can include:

**Contents**

```
main.js
manifest.json
style.css
```

**manifest.json**

```jsonc
{
  "id": "my-widget", // used as the folder name and injected <div> name when loaded on runtime; needs to be unique from other widgets
  "name": "My custom widget",
  "version": "1.0.0", // a version string that follows semantic versioning
  "author": "John Smith",
  "entrypoint": {
    "js": "main.js", // widget entrypoint filename (relative to location of manifest)
    "css": "style.css" // (optional), css style filename (relative to location of manifest)
  }
}
```

**main.js**

```javascript
const { Widget } = require("../widget.js") // this is required because the widget's .zip package is decompressed and loaded on runtime

class MyCustomWidget extends Widget {
  run() {
    const p = document.createElement("p")
    p.textContent = "Some random paragraph text that is a part of this widget"
    this.rootDiv.appendChild(p) // this.rootDiv refers to an injected <div> associated with the widget. The div's id is set to the id from the manifest.json file
  }
}

module.exports = MyCustomWidget // default export MUST be a class definition that extends / subclasses Widget
```

**style.css** (note that `#my-widget` refers to the ID name specified in the manifest, since a `<div>` with such ID is created when the widget is loaded)

```css
#my-widget {
  font-size: 18px;
  font-family: "Roboto", sans-serif;
  color: #f0f0f0;
}
```

### Where to put widget `.zip` packages?

Zipped widget packages are expected to be located in the application's default Electron `app.getPath("userData")` directory within a `widgets` folder. For Linux, this is `$XDG_CONFIG_HOME/mira-ui/widgets/` or `~/.config/mira-ui/widgets/`
