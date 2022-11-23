import { AlgoliaIndexManager } from './util/AlgoliaIndexManager'
export interface IndexInterface<T extends any = any> {
  deleteIndexData(id: string | string[]): Promise<boolean>
  sendIndex(id: string, data: T): Promise<boolean>
  batchSendToIndex(): Promise<boolean>
}

export interface IndexConstructor<Ex = unknown> {
  new (
    args: {
      algoliaIndexManager: AlgoliaIndexManager
    } & Ex
  ): IndexInterface
}

export interface AlgoliaToolsModule {
  algoliaIndexManager: AlgoliaIndexManager
  indices: {
    [collectionName: string]: IndexInterface
  }
}

export type ExPlugin<PluginId extends string, PluginType> = {
  id: PluginId
  new (a: any): PluginType
  prototype: PluginType
}