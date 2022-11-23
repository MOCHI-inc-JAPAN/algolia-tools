import { AlgoliaIndexManager, IndexInterface } from '../../'

type UserSchema = {
  id: string
  name: string
}

export default class UserIndexManager implements IndexInterface {
  private algoliaManager: AlgoliaIndexManager
  public constructor(args: { algoliaManager: AlgoliaIndexManager }) {
    this.algoliaManager = args.algoliaManager
  }

  public sendIndex = async (
    userId: string,
    user: UserSchema
  ): Promise<boolean> => {
    const result = await this.algoliaManager.sendIndex('users', user)
    if (result) {
      console.log(`users index has been updated: [userId:${user.id}]`)
      return true
    } else {
      console.error('users index update has been failed')
      return false
    }
  }

  public batchSendToIndex = async (): Promise<boolean> => {
    const result = await this.algoliaManager.sendIndex('users', [])
    return result
  }

  public deleteIndexData = async (userIds: string[]): Promise<boolean> => {
    const result = await this.algoliaManager.deleteIndexData('users', userIds)
    if (result) {
      console.log(`user index has been deleted: [userIds:${userIds}]`)
      return true
    } else {
      console.error('user index delete has been failed')
      return false
    }
  }
}
