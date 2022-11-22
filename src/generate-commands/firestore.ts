import { Command } from 'commander'
import FirebaseInvoke from '../plugin/FirebaseInvoke'

export const createFirestoreCommanderPlugin = (
  firebaseInvoke: FirebaseInvoke
) => {
  return (commander: Command): void => {
    commander
      .command('batchSendDataToIndex <indexName...> ')
      .action(async (indexName: string[]) => {
        try {
          await Promise.all(
            indexName.map((_indexName) =>
              firebaseInvoke.batchSendDataToIndex({
                index: _indexName,
                collection: firebaseInvoke.firestore.collection(_indexName),
              })
            )
          )
        } catch (e) {
          console.error(e)
        } finally {
          process.exit()
        }
      })
    commander
      .command('resetBatchTime <indexName...> ')
      .action(async (indexName: string[]) => {
        try {
          await Promise.all(
            indexName.map((_indexName) =>
              firebaseInvoke.resetBatchTime(_indexName)
            )
          )
        } catch (e) {
          console.error(e)
        } finally {
          process.exit()
        }
      })
    commander
      .command('removeAllDataFromIndex <indexName...> ')
      .action(async (indexName: string[]) => {
        try {
          await firebaseInvoke.removeAllDataFromIndex(indexName)
        } catch (e) {
          console.error(e)
        } finally {
          process.exit()
        }
      })
  }
}
