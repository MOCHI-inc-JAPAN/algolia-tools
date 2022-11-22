import { Command } from 'commander'
import FirebaseInvoke from '../FirebaseInvoke'

export const createFirestoreCommanderPlugin = (
  firebaseInvoke: FirebaseInvoke
) => {
  return (commander: Command): void => {
    commander
      .command('resetBatchTime <indexName...>')
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
      .command('removeAllDataFromIndex <indexName...>')
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
