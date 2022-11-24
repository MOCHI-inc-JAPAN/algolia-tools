import { Command } from 'commander'
import FirestorePlugin from './FirestorePlugin'

export const createFirestoreCommanderPlugin = (
  firestorePlugin: FirestorePlugin
) => {
  return (commander: Command): void => {
    commander
      .command('resetBatchTime <indexName...>')
      .action(async (indexName: string[]) => {
        try {
          await Promise.all(
            indexName.map((_indexName) =>
              firestorePlugin.resetBatchTime(_indexName)
            )
          )
        } catch (e) {
          console.error(e)
        } finally {
          process.exit()
        }
      })
    commander
      .command('removeAllDataFromIndex <indexName...>')
      .action(async (indexName: string[]) => {
        try {
          await firestorePlugin.removeAllDataFromIndex(indexName)
        } catch (e) {
          console.error(e)
        } finally {
          process.exit()
        }
      })
  }
}
