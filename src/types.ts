import { AlgoliaIndexManager } from './util/AlgoliaIndexManager'
export interface IndexInterface<T extends any = any> {
  deleteIndexData(id: string | string[]): Promise<boolean>
  sendIndex(id: string, data: T): Promise<boolean>
  batchSendToIndex(...params: any[]): Promise<boolean>
}

export interface IndexConstructor {
  new (args: { algoliaManager: AlgoliaIndexManager }): IndexInterface
}
