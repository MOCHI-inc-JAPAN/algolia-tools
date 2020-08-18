import * as firebaseAdmin from 'firebase-admin'
import { AlgoliaIndexManager } from '../util/AlgoliaIndexManager'

export type FirebaseInvokeInternal = {
  admin: typeof firebaseAdmin
  algoliaManager: AlgoliaIndexManager
  batchTimeKey?: string
}

export default class FirebaseInvokeClass {
  public constructor(args: FirebaseInvokeInternal) {
    this.admin = args.admin
    this.algoliaManager = args.algoliaManager
    this.batchTimeKey = args.batchTimeKey || 'algolia-send-index-batchtime'
  }
  public batchTimeKey: FirebaseInvokeInternal['batchTimeKey']
  public admin: FirebaseInvokeInternal['admin']
  public algoliaManager: FirebaseInvokeInternal['algoliaManager']

  public batchSendDataToIndex = async (
    {
      index,
      collection,
    }: {
      index: string
      collection:
        | FirebaseFirestore.CollectionReference
        | FirebaseFirestore.Query
    },
    filter = (data: any) => data
  ) => {
    try {
      const historyRef = this.admin
        .database()
        .ref(`${this.batchTimeKey}/${index}`)
      const _tempValue = await historyRef.once('value')
      let profilesCollectionRef = collection.limit(500)
      if (_tempValue.exists()) {
        const updatedAt = new Date(parseInt(_tempValue.val(), 10))
        console.log(`start updatedAt from:${updatedAt}`)
        profilesCollectionRef = profilesCollectionRef.where(
          'updatedAt',
          '>=',
          updatedAt
        )
      }
      let currentQuerySnapshot = await profilesCollectionRef.get()
      while (!currentQuerySnapshot.empty) {
        const data = currentQuerySnapshot.docs
          .map((doc) => {
            const id = doc.id
            return {
              ...filter(doc.data()),
              id,
              objectID: id,
            }
          })
          .filter((v) => !!v)
        await this.algoliaManager.sendIndex(index, data)
        const lastDoc =
          currentQuerySnapshot.docs[currentQuerySnapshot.docs.length - 1]
        console.log(
          `index ${index} ${data.length} counts are sent. (Last ID : ${lastDoc.id})`
        )
        const nextQuery: firebaseAdmin.firestore.Query = currentQuerySnapshot.query.startAfter(
          lastDoc
        )
        currentQuerySnapshot = await nextQuery.get()
      }
      await historyRef.set(firebaseAdmin.database.ServerValue.TIMESTAMP)
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  public resetBatchTime = async (indexName: string) => {
    try {
      const historyRef = this.admin
        .database()
        .ref(`${this.batchTimeKey}/${indexName}`)
      await historyRef.remove()
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  public async removeAllDataFromIndex(indexName: string[]) {
    try {
      await Promise.all(
        indexName.map((_indexName: string) =>
          this.algoliaManager.removeAllDataFromIndex(_indexName)
        )
      )
    } catch (e) {
      console.log('deleteIndex was failed.')
    }
    try {
      await Promise.all(
        indexName.map((_indexName: string) =>
          this.admin
            .database()
            .ref(`${this.batchTimeKey}/${_indexName}`)
            .remove()
        )
      )
    } catch (e) {
      console.log('deleteIndex was failed.')
    }
  }
}
