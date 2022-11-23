import { Command } from 'commander'
import algoliaModule, { commanderPlugins } from './account/algoliaAccount'
import { AlgoliaProjectManager } from '@mochi-inc-japan/algolia-tools'
import { createAlgoliaCommanderPlugin } from '../src/generate-commands/algolia'

const algoliaTasks = new AlgoliaProjectManager(algoliaModule)

export default function (commander: Command) {
  createAlgoliaCommanderPlugin(algoliaTasks)(commander)
  if(commanderPlugins) {
    commanderPlugins.forEach(commanderPlugin => {
      commanderPlugin(algoliaTasks.algoliaModule)(commander)
    })
  }
}
