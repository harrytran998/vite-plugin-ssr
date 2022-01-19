Example of an internationalized (i18n) `vite-plugin-ssr` app.

Note how the locale is extracted in `server/index.js`.

If you pre-render your app, then have a look at [/examples/i18n-prerender/](/examples/i18n-prerender/) instead.

To run it:

```bash
git clone git@github.com:brillout/vite-plugin-ssr
cd vite-plugin-ssr/examples/i18n/
npm install # (do not use yarn, as yarn installs the entire monorepo)
npm run start
```