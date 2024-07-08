import { createTypedHooks } from 'easy-peasy';
import { Action, action } from 'easy-peasy';
import { createStore, persist } from 'easy-peasy';
import { UTxO } from 'lucid-cardano';

interface WalletStore { connected: boolean, name: string, address: string }
interface peerStore { address: string, balance: number }
interface dataStore { oracleNFTHash: string
                    , oracleNFTCurrencySymbol: string
                    , oracleNFTTokenName: string
                    , validatorAnchorAddress: string
                    , validatorAnchorTxHash: string
                    , priceFeedOracleTxHash: string 
                    , priceFeedOracleAddress: string
                    , currentADAPrice: string
                    , newADAPrice: number
                    , collateralAddress: string
                    , vaultUTxOs: UTxO[]
                    , amountToMint: number
                    , amountToBurn: number
                  }

interface StoreModel {
  wallet: WalletStore
  setWallet: Action<StoreModel, WalletStore>
  availableWallets: string[]
  setAvailableWallets: Action<StoreModel, string[]>
  dataStore: dataStore
  }

const model: StoreModel = {
  wallet: { connected: false, name: '', address: '' },
  setWallet: action((state, newWallet) => { state.wallet = newWallet }),
  availableWallets: [],
  setAvailableWallets: action((state, newAvailableWallets) => { state.availableWallets = newAvailableWallets }),
  dataStore: {  oracleNFTHash: ''
              , oracleNFTCurrencySymbol: ''
              , oracleNFTTokenName: ''
              , validatorAnchorAddress: ''
              , validatorAnchorTxHash: ''
              , priceFeedOracleTxHash: ''
              , priceFeedOracleAddress: ''
              , currentADAPrice: ''
              , newADAPrice: 100
              , collateralAddress: '' 
              , vaultUTxOs: []
              , amountToMint: 0
              , amountToBurn: 0
            }
}

const store = createStore(persist(model))
export default store


const { useStoreActions, useStoreState, useStoreDispatch, useStore } = createTypedHooks<StoreModel>()

export {
  useStoreActions,
  useStoreState,
  useStoreDispatch,
  useStore
}