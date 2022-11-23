import { AlgoliaIndexManager, IndexInterface } from 'algolia-firebase-tools'

export default class TestIndexManager implements IndexInterface {
  private algoliaIndexManager: AlgoliaIndexManager

  public constructor(args: { algoliaIndexManager: AlgoliaIndexManager }) {
    this.algoliaIndexManager = args.algoliaIndexManager
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
