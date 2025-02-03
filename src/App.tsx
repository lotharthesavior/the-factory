import './App.css'
import { useEffect, useRef, useState } from 'react'
import { AssetStore } from './components/Store'
import { Assets, AssetState } from './components/Assets'
import { Store, Table } from 'tinybase'
import { Controllers } from './components/Controllers'
import { Asset, getAssetPrice } from './components/store-utils'

type WalletState = {
  income: number,
  lastUpdate: number, // timestamp of the last update
  count: number, // count of assets at the time of the last update
  lastUpdateCount: number, // count of assets at the time of the last update
}

type AppProps = {
  store: Store,
}

function App({store}: AppProps) {
  const [wallet, setWallet] = useState<WalletState>({
    income: 0,
    lastUpdate: 0,
    count: 0,
    lastUpdateCount: 0,
  })
  const intervalId = useRef<NodeJS.Timeout | null>(null)
  const [assets, setAssets] = useState<AssetState[]>([])

  // @ts-expect-error EffectCallback type erroring here.
  useEffect(() => {
    initSync()
    intervalId.current = startIncomeTimer()
    return () => intervalId.current ? clearInterval(intervalId.current) : null
  }, [])

  const initSync = () => {
    synchronizeWithStore('wallet')
    synchronizeWithStore('assets')
    // @ts-expect-error (The store is not used)
    store.addTableListener('assets', (store, tableId) => synchronizeWithStore(tableId))
    // @ts-expect-error (The store is not used)
    store.addTableListener('wallet', (store, tableId) => synchronizeWithStore(tableId))
  }

  const startIncomeTimer = (): NodeJS.Timeout => {
    if (wallet.lastUpdate === 0) wallet.lastUpdate = Date.now()
    calculateWalletCount(wallet)

    // TODO: move this to WalletService
    return setInterval(() => {
      calculateWalletCount(wallet)
    }, 1000)
  }

  const calculateWalletCount = (wallet: WalletState) => {
    const timeSinceLastUpdate = Math.floor(Date.now() / 1000) - Math.floor(wallet.lastUpdate / 1000)
    wallet.count = timeSinceLastUpdate * wallet.income + wallet.lastUpdateCount
    setWallet({...wallet})
  }

  // TODO: figure a store sync service
  const synchronizeWithStore = (tableId: string) => {
    const data = store.getTable(tableId)
    if (tableId === 'assets') synchronizeAssets(data)
    if (tableId === 'wallet') synchronizeWallet(data)
  }

  const synchronizeAssets = (data: Table) => {
    const initialAssets: AssetState[] = Object.keys(data).map((key) => data[key] as AssetState)
    setAssets(initialAssets)
  }

  const synchronizeWallet = (data: Table) => {
    const initialWallet: WalletState | undefined = Object.keys(data).map((key) => data[key] as WalletState)[0]
    if (!initialWallet) return
    
    wallet.count = initialWallet.count
    wallet.income = initialWallet.income
    wallet.lastUpdate = initialWallet.lastUpdate
    wallet.lastUpdateCount = initialWallet.lastUpdateCount
    setWallet({...wallet})
  }

  // Add count to state.
  const addCount = (extraCount: number) => {
    wallet.count += extraCount
    wallet.lastUpdateCount = wallet.count
    wallet.lastUpdate = Date.now()
    setWallet({...wallet})
    store.setRow('wallet', 'count', wallet)
  }

  // Add asset to state.
  // TODO: figure a service for this
  const addAsset = (asset: Asset) => {
    let existingAsset: AssetState|undefined = assets.find((a) => a.name === asset.name)

    // check asset price and wallet balance
    const assetPrice = getAssetPrice(asset, existingAsset?.count ?? 0)
    if (wallet.count < assetPrice) return
    
    // proceed to add asset
    if (!existingAsset) {
      existingAsset = {name: asset.name, count: 0}
      assets.push(existingAsset)
    }

    existingAsset.count += 1
    setAssets([...assets])
    store.setRow('assets', existingAsset.name, existingAsset)

    wallet.income += asset.increment
    wallet.count = wallet.count - assetPrice
    wallet.lastUpdateCount = wallet.count
    wallet.lastUpdate = Date.now()
    setWallet({...wallet})
    store.setRow('wallet', 'count', wallet)
  }

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="w-fit text-center flex flex-col gap-4">
        
        <h1>The Factory</h1>
        <div>Money: $ {wallet.count}</div>
        <div>Income: $ {wallet.income}</div>

        <Controllers addCount={() => addCount(1)}/>
        <AssetStore addAsset={addAsset} balance={wallet.count} assets={assets}/>
        <Assets assets={assets}/>
      </div>
    </div>
  )
}

export default App
