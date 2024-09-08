import { ListIndicesResponse } from '@algolia/client-search'
import { SearchClient } from 'algoliasearch'
import * as path from 'path'

export const algoliasearch = jest
  .fn<Partial<SearchClient>, [string, string, ...any[]]>()
  .mockImplementation(() => {
    return {
      setSettings: jest.fn(),
      searchSingleIndex: jest.fn(),
      listIndices: jest.fn(async (value?: any) => {
        const remoteFileDir = path.resolve('./src/fixtures/remote')
        const fs = jest.requireActual('fs')
        const files = fs.readdirSync(remoteFileDir)
        return {
          items: files.map((_name: string) => {
            return { name: 'namespace_' + _name.replace('.json', '') }
          }),
        } as Partial<ListIndicesResponse> as ListIndicesResponse
      }),
    }
  })
