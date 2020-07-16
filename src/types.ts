import { AlgoliaIndexManager } from './util/AlgoliaIndexManager'
export interface IndexManager<T extends any = any> {
  deleteIndexData(id: string | string[]): Promise<boolean>
  sendIndex(id: string, data: T): Promise<boolean>
  batchSendToIndex(...params: any[]): Promise<boolean>
}

export interface IndexManagerConstructor {
  new (args: { algoliaManager: AlgoliaIndexManager }): IndexManager
}
