# Presets

Add a `.json` file to this folder to publish it as a website preset. Use the
configuration JSON exported by the test builder (the root object must contain
`topics`, `fams`, and `qs`; `name` is used as the preset title). Keep preset
names unique within this folder.

The GitHub Pages and Render deployment builds the catalog automatically.
To refresh it while running the site locally, run:

```powershell
node tools/build-presets.js
```

The generated `catalog.js` is loaded by both language versions of the site.
