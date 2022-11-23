import { Command } from 'commander'
import { AlgoliaToolsModule } from '@mochi-inc-japan/algolia-tools'

export { createAlgoliaCommanderPlugin } from './generate-commands/algolia'

export type CommanderPlugin = (
  algoliaModule: AlgoliaToolsModule<any>
) => (commander: Command) => void
