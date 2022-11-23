import { SearchClient, SearchIndex } from 'algoliasearch'
import { ListIndicesResponse } from '@algolia/client-search'
import * as path from 'path'
export default jest
  .fn<Partial<SearchClient>, [string, string, ...any[]]>()
  .mockImplementation(() => {
    const indexMock = {
      setSettings: jest.fn(),
    }
    return {
      initIndex: jest.fn<SearchIndex, [string]>(() => {
        return (indexMock as Partial<SearchIndex>) as SearchIndex
      }),
      listIndices: jest.fn(async (value?: any) => {
        const remoteFileDir = path.resolve('./src/fixtures/remote')
        const fs = jest.requireActual('fs')
        const files = fs.readdirSync(remoteFileDir)
        return ({
          items: files.map((_name: string) => {
            return { name: 'namespace_' + _name.replace('.json', '') }
          }),
        } as Partial<ListIndicesResponse>) as ListIndicesResponse
      }),
    }
  })
