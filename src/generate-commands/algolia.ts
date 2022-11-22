import { Command } from 'commander'
import AlgoliaProjectManager from '../util/AlgoliaProjectManager'

export const createAlgoliaCommanderPlugin = (
  algoliaTasks: AlgoliaProjectManager
) => {
  return (commander: Command): void => {
    commander.command('seeAlgoliaAccount').action(async () => {
      try {
        console.log(`algolia_id: ${algoliaTasks.algoliaManager.client.appId}`)
      } catch (e) {
        console.error(e)
      } finally {
        process.exit()
      }
    })

    commander
      .command('seeAlgoliaIndexSetting <indices...>')
      .action(async (args: string[]) => {
        try {
          await algoliaTasks.seeAlgoliaIndexSetting(args)
        } catch (e) {
          console.error(e)
        } finally {
          process.exit()
        }
      })

    commander
      .command('backupAlgoliaIndexSetting <indices...>')
      .action(async (args: string[]) => {
        try {
          await algoliaTasks.backupAlgoliaIndexSetting(args)
        } catch (e) {
          console.error(e)
        } finally {
          process.exit()
        }
      })

    commander
      .command('provisionAlgoliaIndex <indices...>')
      .action(async (args: string[]) => {
        try {
          await algoliaTasks.provisionAlgoliaIndex(args)
        } catch (e) {
          console.error(e)
        } finally {
          process.exit()
        }
      })

    commander.command('provisionAlgoliaIndexAll').action(async () => {
      try {
        await algoliaTasks.provisionAlgoliaIndexAll()
      } catch (e) {
        console.error(e)
      } finally {
        process.exit()
      }
    })

    commander
      .command('updateAlgoliaIndexSetting <indices...>')
      .action(async (args: string[]) => {
        try {
          await algoliaTasks.updateAlgoliaIndexSetting(args)
        } catch (e) {
          console.error(e)
        } finally {
          process.exit()
        }
      })

    commander
      .command('replicateIndex <indexName> <replicaNames...>')
      .action(async (indexName: string, replicas: string[]) => {
        try {
          await algoliaTasks.replicateIndex(indexName, replicas)
        } catch (e) {
          console.error(e)
        } finally {
          process.exit()
        }
      })

    commander
      .command('deleteIndex <indexName...> ')
      .action(async (indexName: string[]) => {
        try {
          await algoliaTasks.deleteIndex(indexName)
        } catch (e) {
          console.error(e)
        } finally {
          process.exit()
        }
      })

    commander.command('deleteIndexAll').action(async () => {
      try {
        await algoliaTasks.deleteIndexAll()
      } catch (e) {
        console.error(e)
      } finally {
        process.exit()
      }
    })

    commander
      .command('syncAlgoliaFromStorage <indexName...> ')
      .action(async (indexName: string[]) => {
        try {
          await algoliaTasks.syncAlgoliaFromStorage(indexName)
        } catch (e) {
          console.error(e)
        } finally {
          process.exit()
        }
      })

    commander.command('backupAlgoliaIndexSettingAll').action(async () => {
      try {
        await algoliaTasks.backupAlgoliaIndexSettingAll()
      } catch (e) {
        console.error(e)
      } finally {
        process.exit()
      }
    })
  }
}
