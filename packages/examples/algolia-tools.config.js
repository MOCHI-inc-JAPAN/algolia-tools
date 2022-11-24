const Plugins = require('@mochi-inc-japan/plugin-algolia-tools-firestore')

module.exports = {
  plugins: [Plugins.FirestorePlugin],
  commanderPlugins: [Plugins.FirestoreCommanderPlugin]
}
