import {
  AlgoliaIndexManager,
  FirebaseInvoke,
  IndexInterface,
} from 'algolia-firebase-tools'

export default class UserIndexManager implements IndexInterface {
  private algoliaIndexManager: AlgoliaIndexManager
  private firebaseInvoke: FirebaseInvoke

  public constructor(args: {
    algoliaIndexManager: AlgoliaIndexManager
    firebaseInvoke: FirebaseInvoke
  }) {
    this.algoliaIndexManager = args.algoliaIndexManager
    this.firebaseInvoke = args.firebaseInvoke
  }

  public sendIndex = async (userId: string, user: UserSchema) => {
    const result = await this.algoliaIndexManager.sendIndex('users', user)
    if (result) {
      console.log(`users index has been updated: [userId:${user.id}]`)
      return true
    } else {
      console.error('users index update has been failed')
      return false
    }
  }

  public batchSendToIndex = async () => {
    const result = await this.algoliaIndexManager.sendIndex('users', [])
    return result
  }

  public deleteIndexData = async (userIds: string[]) => {
    const result = await this.algoliaIndexManager.deleteIndexData(
      'users',
      userIds
    )
    if (result) {
      console.log(`user index has been deleted: [userIds:${userIds}]`)
      return true
    } else {
      console.error('user index delete has been failed')
      return false
    }
  }
}
