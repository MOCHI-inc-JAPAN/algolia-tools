import { getFirestore, Firestore, Query } from 'firebase-admin/firestore'
import { ServerValue, getDatabase, Database } from 'firebase-admin/database'
import { AlgoliaIndexManager } from '@mochi-inc-japan/algolia-tools'

export type FirestorePluginInternal = {
  algoliaIndexManager: AlgoliaIndexManager
  batchTimeKey?: string
}

export default class FirestorePlugin {
  static id = 'firestorePlugin' as const
  public constructor(args: FirestorePluginInternal) {
    this.algoliaIndexManager = args.algoliaIndexManager
    this.batchTimeKey = args.batchTimeKey || 'algolia-send-index-batchtime'
    this.firestore = getFirestore()
    this.database = getDatabase()
  }
  public firestore: Firestore
  public database: Database
  public batchTimeKey: FirestorePluginInternal['batchTimeKey']
  public algoliaIndexManager: FirestorePluginInternal['algoliaIndexManager']

  public batchSendDataToIndex = async (
    {
      index,
      collection,
      timestampName = 'updated_at',
    }: {
      index: string
      collection:
        | FirebaseFirestore.CollectionReference
        | FirebaseFirestore.Query
      timestampName?: string
    },
    filter = (data: any) => data
  ): Promise<boolean> => {
    try {
      const historyRef = this.database.ref(`${this.batchTimeKey}/${index}`)
      const _tempValue = await historyRef.once('value')
      let targetCollectionRef = collection
        .orderBy(timestampName, 'desc')
        .limit(500)
      if (_tempValue.exists()) {
        const updatedAt = new Date(parseInt(_tempValue.val(), 10))
        console.log(`start updatedAt from:${updatedAt}`)
        targetCollectionRef = targetCollectionRef.where(
          timestampName,
          '>=',
          updatedAt
        )
      }
      let currentQuerySnapshot = await targetCollectionRef.get()
      if (currentQuerySnapshot.empty) {
        return true
      }
      while (!currentQuerySnapshot.empty) {
        const promises = currentQuerySnapshot.docs.map(async (doc) => {
          const result = await filter({ id: doc.id, ...doc.data() })
          return {
            objectID: doc.id,
            ...result,
          }
        })
        const data = (await Promise.all(promises)).filter((v) => !!v)
        await this.algoliaIndexManager.sendIndex(index, data)
        const lastDoc =
          currentQuerySnapshot.docs[currentQuerySnapshot.docs.length - 1]
        console.log(
          `index ${index} ${data.length} counts are sent. (Last ID : ${lastDoc.id})`
        )
        const nextQuery: Query = currentQuerySnapshot.query.startAfter(lastDoc)
        currentQuerySnapshot = await nextQuery.get()
      }
      await historyRef.set(ServerValue.TIMESTAMP)
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  public resetBatchTime = async (indexName: string): Promise<boolean> => {
    try {
      const historyRef = this.database.ref(`${this.batchTimeKey}/${indexName}`)
      await historyRef.remove()
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  public async removeAllDataFromIndex(indexName: string[]): Promise<void> {
    try {
      await Promise.all(
        indexName.map((_indexName: string) =>
          this.algoliaIndexManager.removeAllDataFromIndex(_indexName)
        )
      )
    } catch (e) {
      console.log('deleteIndex was failed.')
    }
    try {
      await Promise.all(
        indexName.map((_indexName: string) =>
          this.database.ref(`${this.batchTimeKey}/${_indexName}`).remove()
        )
      )
    } catch (e) {
      console.log('deleteIndex was failed.')
    }
  }
}
