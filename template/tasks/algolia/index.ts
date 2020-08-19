import { CommanderStatic } from 'commander'
import algoliaModule from '../../account/algoliaAccount'
import AlgoliaInvoke from '../../../src/util/AlgoliaInvoke'
import { ALGOLIA_ID, ALGOLIA_ADMIN_KEY, ALGOLIA_SEARCH_KEY } from '../../const'

const algoliaTasks = new AlgoliaInvoke(algoliaModule)

export default function (commander: CommanderStatic): void {
  commander.command('seeAlgoliaAccount').action(async () => {
    console.log(`algolia_id: ${ALGOLIA_ID}`)
    console.log(`algolia_admin_key: ${ALGOLIA_ADMIN_KEY}`)
    console.log(`algolia_search_key: ${ALGOLIA_SEARCH_KEY}`)
    process.exit()
  })

  commander
    .command('seeAlgoliaIndexSetting <indices...>')
    .action(async (args: string[]) => {
      await algoliaTasks.seeAlgoliaIndexSetting(args)
      process.exit()
    })

  commander
    .command('backupAlgoliaIndexSetting <indices...>')
    .action(async (args: string[]) => {
      await algoliaTasks.backupAlgoliaIndexSetting(args)
      process.exit()
    })

  commander
    .command('provisionAlgoliaIndex <indices...>')
    .action(async (args: string[]) => {
      await algoliaTasks.provisionAlgoliaIndex(args)
      process.exit()
    })

  commander.command('provisionAlgoliaIndexAll').action(async () => {
    await algoliaTasks.provisionAlgoliaIndexAll()
    process.exit()
  })

  commander
    .command('updateAlgoliaIndexSetting <indices...>')
    .action(async (args: string[]) => {
      await algoliaTasks.updateAlgoliaIndexSetting(args)
      process.exit()
    })

  commander
    .command('replicateIndex <indexName> <replicaNames...>')
    .action(async (indexName, replicas) => {
      await algoliaTasks.replicateIndex(indexName, replicas)
      process.exit()
    })

  commander
    .command('deleteIndex <indexName...> ')
    .action(async (indexName: string[]) => {
      await algoliaTasks.deleteIndex(indexName)
      process.exit()
    })

  commander
    .command('syncAlgoliaFromStorage <indexName...> ')
    .action(async (indexName: string[]) => {
      await algoliaTasks.syncAlgoliaFromStorage(indexName)
      process.exit()
    })

  commander.command('backupAlgoliaIndexSettingAll').action(async (_args) => {
    await algoliaTasks.backupAlgoliaIndexSettingAll()
    process.exit()
  })
}
