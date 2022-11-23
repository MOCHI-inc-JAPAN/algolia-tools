import { Command } from 'commander'
import { AlgoliaProjectManager } from '@mochi-inc-japan/algolia-tools'

export const createAlgoliaCommanderPlugin = (
  algoliaTasks: AlgoliaProjectManager
) => {
  return (commander: Command): void => {
    commander.command('seeAlgoliaAccount').action(async () => {
      try {
        console.log(
          `algolia_id: ${algoliaTasks.algoliaModule.algoliaIndexManager.client.appId}`,
        )
        console.log(
          `index_name_space: ${algoliaTasks.algoliaModule.algoliaIndexManager.indexNamespace}`
        )
      } catch (e) {
        console.error(e)
      } finally {
        process.exit()
      }
    })

    commander
      .command('seeAlgoliaIndexSetting <indexName...>')
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
      .command('backupAlgoliaIndexSetting <indexName...>')
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
      .command('provisionAlgoliaIndex <indexName...>')
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
      .command('updateAlgoliaIndexSetting <indexName...>')
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
      .command('deleteIndex <indexName...>')
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
      .command('batchSendDataToIndex <indexName...>')
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
