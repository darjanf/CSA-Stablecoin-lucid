import type { NextPage } from 'next'
import Head from 'next/head'
import WalletConnect from '../components/WalletConnect'
import { useStoreActions, useStoreState } from "../utils/store"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import initLucid from '../utils/lucid'
import { Lucid, Credential, TxHash, Lovelace, Constr, SpendingValidator, Data, fromText, Unit, MintingPolicy, PolicyId, Address, UTxO, applyParamsToScript, Assets, ScriptHash, Redeemer, paymentCredentialOf, KeyHash, generatePrivateKey, getAddressDetails, toUnit } from 'lucid-cardano'
import * as helios from '@hyperionbt/helios'
import {fromAssets, toAssets, union, Value} from "../utils/valueUtils"
import { fromAddress, OfferDatum, OfferInfo, toAddress } from '../utils/offerUtils'
import { kMaxLength } from 'buffer'
import { userColumnDefsUTxO } from "../components/UserColumnDefs";
import { VaultUTxO } from '../types/vaultUTxO'
import { useReactTable, getCoreRowModel, flexRender} from "@tanstack/react-table";


const Helios: NextPage = () => {
  const walletStore = useStoreState((state: any) => state.wallet)
  const dataStore = useStoreState((state: any) => state.dataStore)
  const [nftList, setNftList] = useState([])
  const [lucid, setLucid] = useState<Lucid>()
  const [script, setScript] = useState<SpendingValidator>()
  const [scriptAddress, setScriptAddress] = useState("")
  const [ariadyTxHash, setAriadyTxHash] = useState("")
  const [efrainTxHash, setEfrainTxHash] = useState("")


  useEffect(() => {
    if (lucid) {
      ;
    } else {
      initLucid(walletStore.name).then((Lucid: Lucid) => { setLucid(Lucid) });
    }
    //manual overwrites
    dataStore.oracleNFTHash           = "e4c77b7a51b635da408072325023283fd894ecb62cd8f68b110130724f7261636c654e4654"
    dataStore.oracleNFTCurrencySymbol = "e4c77b7a51b635da408072325023283fd894ecb62cd8f68b11013072"
    dataStore.oracleNFTTokenName      = "4f7261636c654e4654"
    dataStore.validatorAnchorTxHash   = "3a7d0417e22547dc8a12f82c3137a047c512b71d2f34c06a2346e1e95d2c986a"
    dataStore.validatorAnchorAddress  = "addr_test1qqjw6xrjgskemrtnycfncyhqeh4yy6jzqxsaxjenq7xmz8dctd9p753qz0l9qhd0mp2azaluxahcgmgyn8cjgqp7hvzqxc7gnn"
    dataStore.priceFeedOracleAddress  = "addr_test1wqgk9xg8ykcd27qaxqnxc4sxedmxdc5z9qlmklqp3yyhk0gznud83"
    dataStore.collateralAddress       = "addr_test1wrlx3mj22rt8l7f4gafd32yx2rge35hed9gxxsdg7mmlm9q06hm40"
  }, [lucid, dataStore.vaultUTxOs, dataStore.currentADAPrice])

  const Metadata333 = Data.Map(Data.Bytes(), Data.Any());
  type Metadata333 = Data.Static<typeof Metadata333>;
  
  const Metadata222 = Data.Map(Data.Bytes(), Data.Any());
  type Metadata222 = Data.Static<typeof Metadata222>;

  const DatumMetadata = Data.Object({
    metadata: Metadata222,
    version: Data.Integer({ minimum: 1, maximum: 1 }),
    extra: Data.Any(),
  });
  type DatumMetadata = Data.Static<typeof DatumMetadata>;

  type Metadata = {
    name: string;
    description: string;
    ticker?: string;
    url?: string;
    logo?: string;
    decimals?: number;
  };

  type NFTMetadata = {
    name: string;
    image: string;
    mediaType?: string;
    description?: string;
    files?: FileDetails[];
  };

  type FileDetails = {
    name?: string;
    mediaType: string;
    src: string;
  };

  const TxId = Data.Object({
    txId: Data.Bytes()
  })
  type TxId = Data.Static<typeof TxId>;

  const TxOutRef = Data.Object({
    txOutRefId: TxId,
    txOutRefIdx: Data.Integer()
  })
  type TxOutRef = Data.Static<typeof TxOutRef>;

  const OracleMintParams = Data.Object({
    oRefTx: TxOutRef,
    oTokenName: Data.Bytes()
  });
  type OracleMintParams = Data.Static<typeof OracleMintParams>;

  const CollateralDatum = Data.Object({
    colMintingPolicyId: Data.Bytes(),
    colOwner: Data.Bytes(),
    colStablecoinAmount: Data.Integer(),
  });
  type CollateralDatum = Data.Static<typeof CollateralDatum>;

  const CollateralRedeemer = Data.Enum([
      Data.Literal("Redeem"),
      Data.Literal("Liquidate"),
  ]);
  type CollateralRedeemer = Data.Static<typeof CollateralRedeemer>;

  const PriceFeedDatum = Data.Object({
    oADAPriceUSD: Data.Integer()
  });
  type PriceFeedDatum = Data.Static<typeof PriceFeedDatum>;

  const MintRedeemer = Data.Enum([
      Data.Literal("Mint"),
      Data.Literal("Burn"),
      Data.Literal("Liquidate"),
  ]);
  type MintRedeemer = Data.Static<typeof MintRedeemer>;


    // *********************** LOG ALL UTXOS ***********************
  // *************************************************************
  const getCurrentADAPrice = async () => {
    if (lucid) {
      //get current priceFeed from priceFeedOracle
      const allPriceFeedOracleUtxOs = await lucid.utxosAt(dataStore.priceFeedOracleAddress);
      if (allPriceFeedOracleUtxOs.length == 0){ throw new Error("Can't find UtxOs in the priceFeedOracle address")}
      const currentPriceFeedOracleUtxO = allPriceFeedOracleUtxOs.filter((utxo: UTxO) => {
        console.log("utxo")
        console.log(utxo)
        return Object.keys(utxo.assets).some((key) => {
          return key == dataStore.oracleNFTHash;
        });
      });
      if(!currentPriceFeedOracleUtxO){throw new Error("Can't find the UtxO with the OracleNFT in the priceFeedOracle's address")}
      console.log("currentPriceFeedOracleUtxO")
      console.log(currentPriceFeedOracleUtxO)
      const priceFeedDatum:PriceFeedDatum = Data.from(currentPriceFeedOracleUtxO[0].datum ? currentPriceFeedOracleUtxO[0].datum : "", PriceFeedDatum);
      console.log("priceFeedDatum")
      console.log((Number(priceFeedDatum.oADAPriceUSD) / 100).toFixed(2).toString())
      dataStore.currentADAPrice = (Number(priceFeedDatum.oADAPriceUSD) / 100).toFixed(2).toString();
      console.log("dataStore.currentADAPrice")
      console.log(dataStore.currentADAPrice)
      setRefresh(!refresh); // This forces a re-render
    }
  }


  // *********************** LOG ALL UTXOS ***********************
  // *************************************************************
  const logUtxos = async () => {
    if (lucid) {
      const utxos = await lucid.wallet.getUtxos();
      console.log("List of all utxos:");
      console.log(utxos);

      //get utxos at validatorAnchorAddress
      const validatorAnchorAddress = await lucid.utxosAt(dataStore.validatorAnchorAddress);
      console.log("All utxos of validatorAnchor's address");
      console.log(validatorAnchorAddress);

      //get utxos at priceFeedOracleAddress
      const priceFeedOracleUtxOs = await lucid.utxosAt(dataStore.priceFeedOracleAddress);
      console.log("All utxos of priceFeedOracle's address");
      console.log(priceFeedOracleUtxOs);

      //get utxos at collateralAddress
      const collateralUtxOs = await lucid.utxosAt(dataStore.collateralAddress)
      console.log("All utxos of collater's address");
      console.log(collateralUtxOs);
    }
  }

  // *************** LIQUIDATE UNDERCOLLATERIZED VAULT ***************
  // *****************************************************
  const liquidateVault = async (liqTxHash: string, liqTxId: number) => {
    if (lucid) {
      console.log("liquidateVault was called!");
      const walletOwner     = await lucid.wallet.address();
      const walletOwnerPKH  = paymentCredentialOf(walletOwner).hash;

      //get utxos at validatorAnchorAddress
      const allValidatorAnchorUtxOs = await lucid.utxosAt(dataStore.validatorAnchorAddress);
      if (allValidatorAnchorUtxOs.length == 0){ throw new Error("Can't find UtxOs in the priceFeedOracle address")}
      const validatorAnchorUtxOs = allValidatorAnchorUtxOs.filter((utxo: UTxO) => {
        return utxo.txHash == dataStore.validatorAnchorTxHash;
      });

      //get collateralScriptRefUtxO with scriptref from validatorAnchor's address
      const collateralScriptRefUtxO = validatorAnchorUtxOs.find((utxo: UTxO) => {
        return utxo.outputIndex == 1;
      });
      if(!collateralScriptRefUtxO){throw new Error("Can't find collateralScriptRefUtxO in validatorAnchor's address")}
      const collateralScript = collateralScriptRefUtxO.scriptRef
      if(!collateralScript){throw new Error("Can't find script in the collateralScriptRefUtxO")}

      //get mintingScriptRefUtxO with scriptref from validatorAnchor's address
      const mintingScriptRefUtxO = validatorAnchorUtxOs.find((utxo: UTxO) => {
        return utxo.outputIndex == 2;
      });
      if(!mintingScriptRefUtxO){throw new Error("Can't find mintingScriptRefUtxO in validatorAnchor's address")}
      const dUSDMintingScript = mintingScriptRefUtxO.scriptRef
      if(!dUSDMintingScript){throw new Error("Can't find script in the mintingScriptRefUtxO")}
      const dUSDMintingPolicyId : PolicyId = lucid.utils.mintingPolicyToId(dUSDMintingScript)
      console.log("dUSDMintingPolicyId")
      console.log(dUSDMintingPolicyId)

      //get collateralUTxO
      const allCollateralUTxOs = await lucid.utxosAt(dataStore.collateralAddress);
      if(allCollateralUTxOs.length == 0){throw new Error("Can't find UtxOs in the collateral address")}
      const collateralUTxO = allCollateralUTxOs.filter((utxo: UTxO) => {
        const utxoDatum:CollateralDatum = Data.from(utxo.datum ? utxo.datum : "", CollateralDatum);
        console.log("utxoDatum")
        console.log(utxoDatum)
        return utxo.txHash == liqTxHash && utxo.outputIndex == liqTxId && utxoDatum.colMintingPolicyId == dUSDMintingPolicyId;
      });
      console.log("collateralUTxO")
      console.log(collateralUTxO)
      if(collateralUTxO.length == 0){throw new Error("Can't find specific UtxO in the collateral address")}
      if(collateralUTxO.length > 1){throw new Error("Found more than one UtxO's in the collateral address")}

      //get current priceFeed from priceFeedOracle
      const allPriceFeedOracleUtxOs = await lucid.utxosAt(dataStore.priceFeedOracleAddress);
      if (allPriceFeedOracleUtxOs.length == 0){ throw new Error("Can't find UtxOs in the priceFeedOracle address")}
      const currentPriceFeedOracleUtxO = allPriceFeedOracleUtxOs.filter((utxo: UTxO) => {
        return Object.keys(utxo.assets).some((key) => {
          return key == dataStore.oracleNFTHash;
        });
      });
      if(!currentPriceFeedOracleUtxO){throw new Error("Can't find the UtxO with the OracleNFT in the priceFeedOracle's address")}
      console.log("currentPriceFeedOracleUtxO")
      console.log(currentPriceFeedOracleUtxO)
      
      //const collateralRedeemer: CollateralRedeemer = 'Liquidate'
      //const mintingRedeemer: MintRedeemer = "Liquidate";
/*       const CollRedeemer = () => Data.to(BigInt(0));
      const MintingRedeemer = () => Data.to(BigInt(1)) */
      const CollRedeemer = () => Data.to(BigInt(1));
      const LiquidateRedeemer = () => Data.to(BigInt(2))
      const tokenName = fromText("dUSD");
      const assetToMint: Unit = dUSDMintingPolicyId + tokenName;
      const collUtxoDatum:CollateralDatum = Data.from(collateralUTxO[0].datum ? collateralUTxO[0].datum : "", CollateralDatum);
      const amountToMint = BigInt(-collUtxoDatum.colStablecoinAmount);
      //const amountToMint = BigInt(-7);
      console.log("amounttoMint")
      console.log(amountToMint)

      //get UTxO with dUSD to burn
      const utxos = await lucid.wallet.getUtxos();
      const utxoWithDUSD = utxos.find((utxo: UTxO) => {
        return Object.keys(utxo.assets).some((key) => {
            return key == assetToMint;
            
        });
      });
      if (!utxoWithDUSD){ throw new Error("Can't find UtxO with dUSD Stablecoins in current Wallet")}
      console.log("Utxo with dUSD from current Wallet");
      console.log(utxoWithDUSD);

/*       const tx = await lucid
        .newTx()
        .readFrom([collateralScriptRefUtxO, mintingScriptRefUtxO, currentPriceFeedOracleUtxO[0]]) //scriptref of collateralValidatorScript and mintingScript
        .collectFrom([collateralUTxO[0]], CollRedeemer()) //utxo stored in collateral validator
        .mintAssets({[assetToMint]: amountToMint}, MintingRedeemer() ) //burn constant -10 dUSD
        .addSignerKey(walletOwnerPKH)
        .complete();
      const signedTx = await tx.sign().complete()
      const txHash = await signedTx.submit()
      alert("Transaction submitted: " + txHash)
      console.log(txHash) */

      const tx = await lucid
        .newTx()
        //.readFrom([collateralScriptRefUtxO, mintingScriptRefUtxO, currentPriceFeedOracleUtxO[0]]) //scriptref of collateralValidatorScript and mintingScript
        .readFrom([collateralScriptRefUtxO, mintingScriptRefUtxO, currentPriceFeedOracleUtxO[0]])
        .collectFrom([collateralUTxO[0]], CollRedeemer()) //utxo stored in collateral validator
        .mintAssets({[assetToMint]: amountToMint}, LiquidateRedeemer()) //burn constant -10 dUSD
        .addSignerKey(walletOwnerPKH)
        .complete();
      console.log("tx")
      console.log(tx)
      const signedTx = await tx.sign().complete()
      const txHash = await signedTx.submit()
      alert("Transaction submitted: " + txHash)
      console.log(txHash)
    }
  }

  // *************** BURN DUSD STABLECOINS ***************
  // *****************************************************
  const burnStablecoinTokens = async () => {
    if (lucid) {
      console.log("Burn Stablecoin Tokens was called!");
      const walletOwner     = await lucid.wallet.address();
      const walletOwnerPKH  = paymentCredentialOf(walletOwner).hash;

      //get utxos at validatorAnchorAddress
      const allValidatorAnchorUtxOs = await lucid.utxosAt(dataStore.validatorAnchorAddress);
      if (allValidatorAnchorUtxOs.length == 0){ throw new Error("Can't find UtxOs in the priceFeedOracle address")}
      const validatorAnchorUtxOs = allValidatorAnchorUtxOs.filter((utxo: UTxO) => {
        return utxo.txHash == dataStore.validatorAnchorTxHash;
      });

      //get collateralScriptRefUtxO with scriptref from validatorAnchor's address
      const collateralScriptRefUtxO = validatorAnchorUtxOs.find((utxo: UTxO) => {
        return utxo.outputIndex == 1;
      });
      if(!collateralScriptRefUtxO){throw new Error("Can't find collateralScriptRefUtxO in validatorAnchor's address")}
      const collateralScript = collateralScriptRefUtxO.scriptRef
      if(!collateralScript){throw new Error("Can't find script in the collateralScriptRefUtxO")}

      //get mintingScriptRefUtxO with scriptref from validatorAnchor's address
      const mintingScriptRefUtxO = validatorAnchorUtxOs.find((utxo: UTxO) => {
        return utxo.outputIndex == 2;
      });
      if(!mintingScriptRefUtxO){throw new Error("Can't find mintingScriptRefUtxO in validatorAnchor's address")}
      const dUSDMintingScript = mintingScriptRefUtxO.scriptRef
      if(!dUSDMintingScript){throw new Error("Can't find script in the mintingScriptRefUtxO")}
      const dUSDMintingPolicyId : PolicyId = lucid.utils.mintingPolicyToId(dUSDMintingScript)
      console.log("dUSDMintingPolicyId")
      console.log(dUSDMintingPolicyId)

      //get current priceFeed from priceFeedOracle
      const allPriceFeedOracleUtxOs = await lucid.utxosAt(dataStore.priceFeedOracleAddress);
      if (allPriceFeedOracleUtxOs.length == 0){ throw new Error("Can't find UtxOs in the priceFeedOracle address")}
      const currentPriceFeedOracleUtxO = allPriceFeedOracleUtxOs.filter((utxo: UTxO) => {
        return Object.keys(utxo.assets).some((key) => {
          return key == dataStore.oracleNFTHash;
        });
      });
      if(!currentPriceFeedOracleUtxO){throw new Error("Can't find the UtxO with the OracleNFT in the priceFeedOracle's address")}

      //get collateralUTxO
      const allCollateralUTxOs = await lucid.utxosAt(dataStore.collateralAddress);
      if(allCollateralUTxOs.length == 0){throw new Error("Can't find UtxOs in the collateral address")}
      const collateralUTxO = allCollateralUTxOs.filter((utxo: UTxO) => {
        const utxoDatum:CollateralDatum = Data.from(utxo.datum ? utxo.datum : "", CollateralDatum);
        console.log("utxoDatum")
        console.log(utxoDatum)
        return utxoDatum.colOwner == walletOwnerPKH && utxoDatum.colMintingPolicyId == dUSDMintingPolicyId;
      });
      console.log("collateralUTxO")
      console.log(collateralUTxO)
      if(collateralUTxO.length == 0){throw new Error("Can't find specific UtxO in the collateral address")}
      const collUTxODatum:CollateralDatum = Data.from(collateralUTxO[0].datum? collateralUTxO[0].datum : "", CollateralDatum);
      
      const collateralRedeemer: CollateralRedeemer = 'Redeem'
      const mintingRedeemer: MintRedeemer = "Burn";
      const CollRedeemer = () => Data.to(BigInt(0));
      const MintingRedeemer = () => Data.to(BigInt(1))
      const tokenName = fromText("dUSD");
      const assetToMint: Unit = dUSDMintingPolicyId + tokenName;
      const amountToMint = BigInt(-(dataStore.amountToBurn));

      //get UTxO with dUSD to burn
      const utxos = await lucid.wallet.getUtxos();
      const utxoWithDUSD = utxos.find((utxo: UTxO) => {
        console.log(utxo)
        return Object.keys(utxo.assets).some((key) => {
            return key == assetToMint;
            
        });
      });
      if (!utxoWithDUSD){ throw new Error("Can't find UtxO with dUSD Stablecoins in current Wallet")}
      console.log("Utxo with dUSD from current Wallet");
      console.log(utxoWithDUSD);

      const tx = await lucid
        .newTx()
        .readFrom([collateralScriptRefUtxO, mintingScriptRefUtxO, currentPriceFeedOracleUtxO[0]]) //scriptref of collateralValidatorScript and mintingScript
        .collectFrom([collateralUTxO[0]], CollRedeemer()) //utxo stored in collateral validator
        .mintAssets({[assetToMint]: amountToMint}, MintingRedeemer() ) //burn constant -10 dUSD
        .addSignerKey(walletOwnerPKH)
        .complete();
      const signedTx = await tx.sign().complete()
      const txHash = await signedTx.submit()
      alert("Transaction submitted: " + txHash)
      console.log(txHash)
    }
  }
  
  // *************** MINT DUSD STABLECOINS ***************
  // *****************************************************
  const mintStablecoinTokens = async () => {
    if (lucid) {
      console.log("Mint Stablecoin Tokens was called!");

      //get utxos at validatorAnchorAddress
      const allValidatorAnchorUtxOs = await lucid.utxosAt(dataStore.validatorAnchorAddress);
      if (allValidatorAnchorUtxOs.length == 0){ throw new Error("Can't find UtxO in the priceFeedOracle address")}
      const validatorAnchorUtxOs = allValidatorAnchorUtxOs.filter((utxo: UTxO) => {
        return utxo.txHash == dataStore.validatorAnchorTxHash;
      });

      //get collateralScriptRefUtxO with scriptref from validatorAnchor's address
      const collateralScriptRefUtxO = validatorAnchorUtxOs.find((utxo: UTxO) => {
        return utxo.outputIndex == 1;
      });
      if(!collateralScriptRefUtxO){throw new Error("Can't find collateralScriptRefUtxO in validatorAnchor's address")}
      const collateralScript = collateralScriptRefUtxO.scriptRef
      if(!collateralScript){throw new Error("Can't find script in the collateralScriptRefUtxO")}

      //get mintingScriptRefUtxO with scriptref from validatorAnchor's address
      const mintingScriptRefUtxO = validatorAnchorUtxOs.find((utxo: UTxO) => {
        return utxo.outputIndex == 2;
      });
      if(!mintingScriptRefUtxO){throw new Error("Can't find mintingScriptRefUtxO in validatorAnchor's address")}
      const dUSDMintingScript = mintingScriptRefUtxO.scriptRef
      if(!dUSDMintingScript){throw new Error("Can't find script in the mintingScriptRefUtxO")}

      //get current priceFeed from priceFeedOracle
      const allPriceFeedOracleUtxOs = await lucid.utxosAt(dataStore.priceFeedOracleAddress);
      if (allPriceFeedOracleUtxOs.length == 0){ throw new Error("Can't find UtxOs in the priceFeedOracle address")}
      const currentPriceFeedOracleUtxO = allPriceFeedOracleUtxOs.filter((utxo: UTxO) => {
        return Object.keys(utxo.assets).some((key) => {
          return key == dataStore.oracleNFTHash;
        });
      });
      if(!currentPriceFeedOracleUtxO){throw new Error("Can't find the UtxO with the OracleNFT in the priceFeedOracle's address")}

      const MintRedeemer = () => Data.to(BigInt(0))
      //const BurnRedeemer      = () => Data.to(BigInt(1))
      //const LiquidateRedeemer = () => Data.to(BigInt(2))

      const dUSDMintingPolicyId : PolicyId = lucid.utils.mintingPolicyToId(dUSDMintingScript)
      const tokenName = fromText("dUSD");
      const assetToMint: Unit = dUSDMintingPolicyId + tokenName;
      const amountToMint = BigInt(dataStore.amountToMint);
      const walletOwner     = await lucid.wallet.address();
      const walletOwnerPKH  = paymentCredentialOf(walletOwner).hash;
      const collateralDatum: CollateralDatum = {
        colMintingPolicyId: dUSDMintingPolicyId,
        colOwner: walletOwnerPKH,
        colStablecoinAmount: amountToMint
      }
      console.log("amountToMint")
      console.log(amountToMint)
      console.log("dataStore.currentADAPrice")
      console.log(dataStore.currentADAPrice)
      const collAmount = Number(amountToMint) * 15 / (dataStore.currentADAPrice * 10) * Number(1000000)
      const collateralVal : Assets = { "lovelace" : BigInt(collAmount)}
      console.log("collateralVal")
      console.log(collateralVal)

      const tx = await lucid
        .newTx()
        .readFrom([currentPriceFeedOracleUtxO[0]])
        .mintAssets({[assetToMint]: amountToMint}, MintRedeemer())
        .attachMintingPolicy(dUSDMintingScript)
        .payToContract(dataStore.collateralAddress,{inline: Data.to<CollateralDatum>(collateralDatum, CollateralDatum)}, collateralVal)
        .addSignerKey(walletOwnerPKH)
        .complete();
      const signedTx = await tx.sign().complete()
      const txHash = await signedTx.submit()
      alert("Transaction submitted: " + txHash)
      console.log(txHash)
    }
  }

  // *********************** INITIALIZE ADA PRICEFEED ORACLE ***********************
  // *******************************************************************************
  const initPriceFeedOracle = async () => {
    if (lucid) {
      // get utxo with OracleNFT from current wallet 
      const utxos = await lucid.wallet.getUtxos();
      const walletOwner = await lucid.wallet.address();
      const walletOwnerPKH = paymentCredentialOf(walletOwner).hash;
      const utxoWithOracleNFT = utxos.find((utxo: UTxO) => {
        return Object.keys(utxo.assets).some((key) => {
            return key == dataStore.oracleNFTHash;
        });
      });
      if (!utxoWithOracleNFT){ throw new Error("Can't find UtxO with OracleNFT in current Wallet")}
      console.log("Utxo with OracleNFT from current Wallet");
      console.log(utxoWithOracleNFT);
      
      //const priceFeedOracleDatum = BigInt(100)
      const priceFeedOracleDatum: PriceFeedDatum = {
        oADAPriceUSD: BigInt(100)
      }
      const priceFeedOracleNFTVal : Assets = {[dataStore.oracleNFTHash] : BigInt(1)} 
      const tx = await lucid
        .newTx()
        .payToContract(dataStore.priceFeedOracleAddress, {inline: Data.to<PriceFeedDatum>(priceFeedOracleDatum, PriceFeedDatum)}, priceFeedOracleNFTVal)
        .complete();
      const signedTx = await tx.sign().complete()
      const txHash = await signedTx.submit()
      alert("Transaction submitted: " + txHash)
    }
  }

   // *********************** UPDATE ADA PRICEFEED ORACLE ***********************
  // *******************************************************************************
  const updatePriceFeedOracle = async () => {
    if (lucid) {
      // get utxo with OracleNFT from current wallet 
      const utxos = await lucid.wallet.getUtxos();
      const walletOwner = await lucid.wallet.address();
      const walletOwnerPKH = paymentCredentialOf(walletOwner).hash;

      //get current priceFeed from priceFeedOracle
      const allPriceFeedOracleUtxOs = await lucid.utxosAt(dataStore.priceFeedOracleAddress);
      if (allPriceFeedOracleUtxOs.length == 0){ throw new Error("Can't find UtxOs in the priceFeedOracle address")}
      const currentPriceFeedOracleUtxO = allPriceFeedOracleUtxOs.filter((utxo: UTxO) => {
        return Object.keys(utxo.assets).some((key) => {
          return key == dataStore.oracleNFTHash;
        });
      });
      if(!currentPriceFeedOracleUtxO){throw new Error("Can't find the UtxO with the OracleNFT in the priceFeedOracle's address")}
      console.log("currentPriceFeedOracleUtxO")
      console.log(currentPriceFeedOracleUtxO)
      //get utxos at validatorAnchorAddress
      const allValidatorAnchorUtxOs = await lucid.utxosAt(dataStore.validatorAnchorAddress);
      if (allValidatorAnchorUtxOs.length == 0){ throw new Error("Can't find UtxO in the priceFeedOracle address")}
      const validatorAnchorUtxOs = allValidatorAnchorUtxOs.filter((utxo: UTxO) => {
        return utxo.txHash == dataStore.validatorAnchorTxHash && utxo.outputIndex == 0;
      });
      console.log("validatorAnchorUtxOs")
      console.log(validatorAnchorUtxOs)
      //get priceFeedOracleScriptRefUtxO with scriptref from validatorAnchor's address
      const priceFeedOracleScriptRefUtxO = validatorAnchorUtxOs.find((utxo: UTxO) => {
        return utxo.outputIndex == 0;
      });
      if(!priceFeedOracleScriptRefUtxO){throw new Error("Can't find priceFeedOracleScriptRefUtxO in validatorAnchor's address")}
      const priceFeedOracleScript = priceFeedOracleScriptRefUtxO.scriptRef
      if(!priceFeedOracleScript){throw new Error("Can't find script in the priceFeedOracleScriptRefUtxO")}

      const PriceFeedRedeemer = () => Data.to(BigInt(0))
      //const priceFeedOracleDatum = BigInt(80)
      const priceFeedOracleDatum: PriceFeedDatum = {
        oADAPriceUSD: BigInt(dataStore.newADAPrice)
      }
      const assetOracleNFT: Unit = dataStore.oracleNFTCurrencySymbol + dataStore.oracleNFTTokenName;
      const priceFeedOracleNFTVal : Assets = {[assetOracleNFT] : BigInt(1)}
      console.log("assetOracleNFT")
      console.log(assetOracleNFT)
      const tx = await lucid
        .newTx()
        .readFrom([priceFeedOracleScriptRefUtxO])
        .collectFrom(currentPriceFeedOracleUtxO, PriceFeedRedeemer())
        .payToContract(dataStore.priceFeedOracleAddress, {inline: Data.to<PriceFeedDatum>(priceFeedOracleDatum, PriceFeedDatum)}, priceFeedOracleNFTVal)
        .addSignerKey(walletOwnerPKH)
        .complete();
      const signedTx = await tx.sign().complete()
      const txHash = await signedTx.submit()
      alert("Transaction submitted: " + txHash)

/*       cardano-cli transaction build \
      --babbage-era \
      $PREVIEW \
      --tx-in $utxoinpayment \
      --tx-in $utxoin \
      --tx-in-inline-datum-present \
      --tx-in-redeemer-file $redeemerfile \
      --tx-in-script-file $script \
      --tx-out $oracleaddress+$output+"$tokenamount $policyid.$tokenname" \
      --tx-out-inline-datum-file $datumfile \
      --change-address $changeaddress \
      --required-signer-hash $signerPKH1 \
      --tx-in-collateral $collateral \
      --protocol-params-file $paramsfile \
      --out-file $txunsignedfile */
    }
  }

  // *********************** MINT ORACLE NFT ***********************
  // ***************************************************************
  const mintOracleNFT = async () => {
    if (lucid) {
      const utxos                             = await lucid.wallet.getUtxos();
      const inputTx                           = utxos[0]
      const inputTxHash                       = inputTx.txHash
      const txID : TxId = {
        txId: inputTxHash
      }
      const inputTxHashData                   = new Constr(0, [inputTxHash])
      const inputTxIndexData                  = BigInt(inputTx.outputIndex)
      const inputTxRef                        = new Constr(0, [inputTxHashData, inputTxIndexData])
/*       const inputTxRef: TxOutRef = {
        txOutRefId: txID,
        txOutRefIdx: inputTxIndexData
      } */
      const tokenName                         = fromText("OracleNFT");
/*       const oracleMintParam: OracleMintParams = {
        oRefTx: inputTxRef,
        oTokenName: tokenName
      } */
      const oracleMintParams                  = new Constr(0, [inputTxRef, tokenName]);
      const MintRedeemer                      = () => Data.to(new Constr(0, []))
      const BurnRedeemer                      = () => Data.to(new Constr(1, []))
      const oracleNFTMintingCbor              = "5901e35901e00100003232323232323232322223232323232323232323253330113370e9000001099191919299980a99809198091980900080119b8733301322253330190011002133003337000049001180d000a4000008900119b87375a603200690010a4c2c664602644a666030002294054cc8cc0600045289801980d00089801180c800919baf30183014001301800a3758602e00e66e3cdd7180c0009bae30163015008301500133223301122533301600116153330153375e0086034603000226eacc064c0600044c008c05c004004c050004dd5980a19180a180a180a00098098020b180a001180a0009baa30113010002300c3010001300b006300a007533300a3370e900000109919191919191919299980919b89371a00290200991924ca6660280022930b180a0018b1bae00130130013011006533300e3370e900000109919299980819b873015001480004c94ccc044cdd79ba74bd701ba7301300113253330123370e6e340052040132323232324994ccc05c004526163017003375a002602c002602800a2c6eb8c05000458c05000458dd500098088008b180880118088009baa001300d00116300d002300d00137540064466600a0040029408c8c0088cc0080080048c0088cc0080080048c018dd5000ab9a5573eae895d0aab9e5573b"
      const oracleNFTMinting : MintingPolicy  = {
        type: "PlutusV2", 
        script: applyParamsToScript(oracleNFTMintingCbor, [oracleMintParams])
      }
      const oracleNFTMintingPolicyId          = lucid.utils.mintingPolicyToId(oracleNFTMinting)
      const assetToMint: Unit                 = oracleNFTMintingPolicyId + tokenName;
      const metadata : NFTMetadata            = {
        name: "OracleNFT Token",
        image: "ipfs://QmRhTTbUrPYEw3mJGGhQqQST9k86v1DPBiTTWJGKDJsVFw",
        description: "OracleNFT for updating the pricefeed oracle"
      }

      const tx = await lucid.newTx()
      .collectFrom([inputTx])
      .mintAssets({[assetToMint]: BigInt(1)}, MintRedeemer())
      .attachMintingPolicy(oracleNFTMinting)
      .attachMetadata(721, metadata)
      .complete()
      const signedTx = await tx.sign().complete()
      const txHash = await signedTx.submit()
      dataStore.oracleNFTHash = assetToMint
      dataStore.oracleNFTCurrencySymbol = oracleNFTMintingPolicyId
      dataStore.oracleNFTTokenName = tokenName
      console.log("dataStore.oracleNFTHash")
      console.log(dataStore.oracleNFTHash)
      console.log("dataStore.oracleNFTCurrencySymbol")
      console.log(dataStore.oracleNFTCurrencySymbol)
      console.log("dataStore.oracleNFTTokenName")
      console.log(dataStore.oracleNFTTokenName)
      console.log(txHash)
      await alert(`Transaction submitted: ${txHash}`)
    }
  }

  // *********************** DEPLOY VALIDATOR SCRIPTS ***********************
  // ************************************************************************
  const deployValidatorScripts = async () => {
    if (lucid) {
      const utxos           = await lucid.wallet.getUtxos();
      const inputTx         = utxos[0]
      const walletOwner     = await lucid.wallet.address();
      const walletOwnerPKH  = paymentCredentialOf(walletOwner).hash;

      //create priceFeedOracleValidatorScript with params
      const priceFeedOracleParams = new Constr(0, [dataStore.oracleNFTCurrencySymbol, dataStore.oracleNFTTokenName, walletOwnerPKH]);
      const priceFeedOracleCbor = "59040f59040c010000323232323232323232323232323232323232323232323222223232323232323232323322323232323232323232533302a3370e90010010999991191919299981799b87480080084cccc88ccccc888cc0c4894ccc0dc004489400454ccc0d8cdd7981d981c80080209802981c80089801181c000800919111801001981b0009ba900200122230020031225001375c6064002008464446004006646eb4c0d0c0c0004c07c0045854ccc0bccdc3a4008004264446004006646eb4c0ccc0bc004c078c0c80044894004c0c8008c0c8004dd518179815181580119ba548000c0a4ccc078dd618168041bac302d007302d0013756605a6058605800c4a666056a66605666e1c031200013301b3301b3301b3370e666038646eacc0bcc0b8004c0a8cc094dd6181700498170011bae302e006375c605c00a900119b8733301c323756605e605c002605466603e6eb0c0b8024dd6181700418170011bae302e006375c605c00a900119813981718168029bac302e0073371090000008a99981599b8700c480084cc09cc0b8c0b4014dd61817003899813981718168029bac302e0071498585858c0b4008c0b4004dd518151814803181400098120099918139813981398118009813000981298128009810981280098100009bad00b00a375a014a66603a66e1d20000021323232324994ccc084004526163021003375a00260400022c604000460400026ea801d4ccc064cdc3a40000042646464a666038a6646603a0022944cdc3800a4000266e1c00520381323232533301f337126e340052040132323253330223370e6e340052038132324994ccc09000452616302400316375c002604600260420062c6eb8004c080004c07801058dc68009bae001301c00116301c002301c001375400846464646400aa66602a66e1d20000021323232324994ccc064004526163019003375a00260300022c603000460300026ea800488ccc048008005281111999802001240004666600a00490003ad3756002006460046ea40048888cc038894ccc050004401454ccc04ccdd7980c180b00080309802180b980b00089801180a800800911299980799b8730043300530083012300e33009003001002480084c048cc014c020c048c038cc02400c00400858cc0208894ccc03c00440084cc00ccdc0001240046020002900011804112999807000880209929998071802000899803000980198080010980198080011808000a5eb815d011198020011806180400091198029129998058008b0992999805998030021807000898071806800898019806801180498068008011119baf374e600c0046e9cc0180048c008894ccc0200045280a99980399baf300a00100314a22600460120024646004466004004002460044660040040024600a600a0024600c6ea80055cd2ab9f5744ae8555cf2ab9d1"
      const priceFeedOracleValidatorScript : SpendingValidator = {
        type: "PlutusV2",
        script: applyParamsToScript(priceFeedOracleCbor, [priceFeedOracleParams])
      }

      //create collateralValidatorScript with params
      const collateralValidatorScript : SpendingValidator = {
        type: "PlutusV2",
        script: "5901c65901c30100003232323232323232323232322223232323232332232323232533301553330153370e00c900009980799807999180911299980c8008a50153330183375e603600200629444c008c068004c060008dd6180c1809180b80219b8733301122253330190011002133003337000049001180d000a4000002900119b873010375a6030602e0046eb4c064c06000454ccc054cdc380324004266e1cc040dd6980c180b8011bad3019301800113370e60206eb4c060c05c008dd6980c980c0008a4c2c66446602444a6660320022c2a66603066ebc010c074c06c0044dd5980e180d80089801180d000800980b8011bab30170033015001301100b323014300f001301030143010001375a00e00c6eb40194ccc034cdc3a40000042646464a666020a664660220022944cdc3800a4000266e1c0052038132323253330133370e6e340052038132323232324994ccc060004526163018003375a002602e002602a0062c6eb8004c050004c04801058dc68009bae001301000116301000230100013754006446660100040029408cdc0a40000024646004466004004002460044660040040024600c60040024600a600a0024600c6ea80055cd2ab9f5744ae8555cf2ab9d01"
      }

      const mintingOracleNFTPolicyID : PolicyId = dataStore.oracleNFTCurrencySymbol
      const mintingOracleNFTTokenName = dataStore.oracleNFTTokenName
      const mintingOracleValidatorParam : ScriptHash = lucid.utils.validatorToScriptHash(priceFeedOracleValidatorScript)
      const mintingCollateralValidatorParam : ScriptHash = lucid.utils.validatorToScriptHash(collateralValidatorScript)
      const mintingCollateralMinPercent = BigInt(150)
      const mintParams = new Constr(0, [mintingOracleNFTPolicyID, mintingOracleNFTTokenName, mintingOracleValidatorParam, mintingCollateralValidatorParam, mintingCollateralMinPercent])
      const dUSDMintingCbor = "590ae3590ae0010000323232323232323232323232323232323232323232323232322223232323232332232323232323232323232323232533302b3370e900000109919191919299981819b874801000854ccc0c14ccc0c0cdc380a2400026604e66e212000375a6068008664605844a666068002294054cc0c4c00cc0d80044c008c0d40048c8c8c8c8c94ccc0d8cdc3a40040042646464a66607266e1d200400213232330323303233032330323375e607c00c607c03466e24dd6981f80799b833370466e0ccdc11998199bab303e0090290294832004dd6981f181e80d2419002646eb4c0fcc0e4004c0a8c0f8030cdd7981f001181f00899b87375a607c607a0026eb4c0fc03ccc0a0c0f8004dd6181f00a181e000981b1815981e0008b181e001181e0009baa303930380041630390023039001375464606e6062002606c0046068002605c0026eb0c0cc02c54ccc0c0cdc380a240042646464a66606666e1d20040021323253330353370e03290000a50153330353370e03290010998161981619b873025375a6070606e0026eb4c0e4024cc088c0e0004dd6181c00719b88375a607201290000a99981a99b87019480104cc0b0cc0b0cdc398129bad30383037001375a607201266e20cdc199b823370666e08ccc0b4c8dd5981c981c181980099181c981c18198009814198149191919299981c99b8748000008528099baf303c001303c018303c002303c0013754646074606800264607460680026072607060660026eb0c0e004808c08d20c801375a6070606e028646eb4c0e4c0cc004c090c0e001920c80133704604a6eb4c0e4024098cdc41bad3039009480004cc0b0cc0b0cdc398129bad30383037001375a607201266e20cdc199b823370666e08ccc0b4c8dd5981c981c181980099181c981c18198009814198149191919299981c99b8748000008528099baf303c001303c018303c002303c0013754646074606800264607460680026072607060660026eb0c0e004808c08d20c801375a6070606e028646eb4c0e4c0cc004c090c0e001920c80133704604a6eb4c0e4024098cdc41bad303900948000c0d8004c0c0c094c0d800458c0d8008c0d8004dd519181a1816981700099181a181998170009811998121191919299981a19b8748000008528099baf3037001303701330370023037001375464606a605e00264606a605e00260686066605c0026eb0c0cc03454ccc0c0cdc380a240082646464a66606666e1d20040021323253330353370e03290000a50153330353370e03290010998161981619b873025375a6070606e0026eb4c0e4024cc088c0e0004dd6181c00719b88375a607201290000a99981a99b87019480104cc0b0cc0b0cdc398129bad30383037001375a607201266e20cdc199b823370666e08ccc0b4c8dd5981c981c181980099181c981c18198009814198149191919299981c99b8748000008528099baf303c001303c018303c002303c0013754646074606800264607460680026072607060660026eb0c0e004808c08d20c801375a6070606e028646eb4c0e4c0cc004c090c0e001920c80133704604a6eb4c0e4024098cdc41bad3039009480004cc0b0cc0b0cdc398129bad30383037001375a607201266e20cdc199b823370666e08ccc0b4c8dd5981c981c181980099181c981c18198009814198149191919299981c99b8748000008528099baf303c001303c018303c002303c0013754646074606800264607460680026072607060660026eb0c0e004808c08d20c801375a6070606e028646eb4c0e4c0cc004c090c0e001920c80133704604a6eb4c0e4024098cdc41bad303900948000c0d8004c0c0c094c0d800458c0d8008c0d8004dd519181a1816981700099181a181998170009811998121191919299981a19b8748000008528099baf3037001303701330370023037001375464606a605e00264606a605e00260686066605c0026eb0c0cc0344c8c8c94ccc0cccdc3a400800426464a66606a66e1c065200014a02a66606a66e1c065200213302c3302c3370e604a6eb4c0e0c0dc004dd6981c80499811181c0009bac303800e337106eb4c0e40252000153330353370e03290020998161981619b873025375a6070606e0026eb4c0e4024cdc419b833370466e0ccdc1199816991bab30393038303300132303930383033001302833029232323253330393370e90000010a5013375e60780026078030607800460780026ea8c8c0e8c0d0004c8c0e8c0d0004c0e4c0e0c0cc004dd6181c009011811a4190026eb4c0e0c0dc050c8dd6981c98198009812181c003241900266e08c094dd6981c80481319b88375a607201290000998161981619b873025375a6070606e0026eb4c0e4024cdc419b833370466e0ccdc1199816991bab30393038303300132303930383033001302833029232323253330393370e90000010a5013375e60780026078030607800460780026ea8c8c0e8c0d0004c8c0e8c0d0004c0e4c0e0c0cc004dd6181c009011811a4190026eb4c0e0c0dc050c8dd6981c98198009812181c003241900266e08c094dd6981c80481319b88375a60720129000181b00098181812981b0008b181b001181b0009baa323034302d302e0013230343033302e001302333024232323253330343370e90000010a5013375e606e002606e026606e004606e0026ea8c8c0d4c0bc004c8c0d4c0bc004c0d0c0ccc0b8004dd618198068a4c2c2c606600460660026ea8c8c0c4c0a8c0ac004c8c0c4c0c0c0ac004c080cc0848cc094cdc3999813191bab30323031302c00130313030302b001375c60620206eb8c0c403d200232323253330313370e90000010a5013375e60680026068022606800460680026ea8c8c0c8c0b0004c8c0c8c0b0004c0c4c0c0c0ac004dd6181800498178009991198141129998180008b0a99981799baf004303430320011375660666064002260046062002002605c0026eacc0b801458c0b8008c0b8004dd51815981500319181518120009814800981418140009813800981300098101813000980f802981180098110009810800980d8051bad007006375a00ca66603466e1d20000021323232533301d53301b3370e0029000099b87001480e04c8c8c94ccc080cdc49b8d001481004c8c8c94ccc08ccdc39b8d001480e04c8c8c94ccc098cdc39b8d001480e04c8c8c8c8c926533302b001149858c0ac00cdd6800981500098140018b1bae0013027001302500316375c002604800260440062c6eb8004c084004c07c01058dc68009bae001301d00116301d002301d00137540064601e44a66602e002294054ccc058cdd7980c8008018a5113002301800148810023232323200553330153370e900000109919191924ca6660320022930b180c8019bad001301800116301800230180013754002466e0520000014820225e88c8c8c8c80154ccc048cdc3a40000042646464a66602aa6602666e1c005200013370e002901c0991919299980c19b87371a002901c0991919191924ca66603a0022930b180e8019bad001301c001301a00316375c0026032002602e0082c6e34004dd7000980a8008b180a801180a8009baa0012533300f00116132533301000113012002163010001230082253330100011004132533301030040011330060013003301200213003301200230120014bd702ba02233300b0020014a0444666600800490001199980280124000eb4dd5800801918011ba900122223300522533300d00110051533300c3375e6022601e00200c260086020601e00226004601c0020024646004466004004002460044660040040024600e600e002460106ea80048cc00c004008528ab9a5573eae895d0aab9e5573b"
      const dUSDMintingScript : MintingPolicy  = {
        type: "PlutusV2", 
        script: applyParamsToScript(dUSDMintingCbor, [mintParams])
      }

      const Datum = () => Data.void();
      const tx = await lucid
        .newTx()
        .collectFrom([inputTx])
        .payToAddressWithData(dataStore.validatorAnchorAddress, {scriptRef: priceFeedOracleValidatorScript}, {})
        .payToAddressWithData(dataStore.validatorAnchorAddress, {scriptRef: collateralValidatorScript}, {})
        .payToAddressWithData(dataStore.validatorAnchorAddress, {scriptRef: dUSDMintingScript}, {})
        .complete();
      const signedTx = await tx.sign().complete()
      const txHash = await signedTx.submit()
      dataStore.validatorAnchorTxHash = txHash
      dataStore.priceFeedOracleAddress = lucid.utils.validatorToAddress(priceFeedOracleValidatorScript)
      dataStore.collateralAddress = lucid.utils.validatorToAddress(collateralValidatorScript)
      dataStore.dUSDMintingPolicyId = lucid.utils.mintingPolicyToId(dUSDMintingScript)
      console.log("dataStore.validatorAnchorTxHash")
      console.log(dataStore.validatorAnchorTxHash)
      console.log("dataStore.priceFeedOracleAddress")
      console.log(dataStore.priceFeedOracleAddress)
      console.log("dataStore.collateralAddress")
      console.log(dataStore.collateralAddress)
      await alert(`Transaction submitted: ${txHash}`)
    }
  }
// *********************** GET VAULT LIST **********************
  // *************************************************************
  const [refresh, setRefresh] = useState(false);
  
  const getVaultList = async () => {
    console.log("getVaultList was called")
    if(lucid) {
      //get utxos at validatorAnchorAddress
      const allValidatorAnchorUtxOs = await lucid.utxosAt(dataStore.validatorAnchorAddress);
      if (allValidatorAnchorUtxOs.length == 0){ throw new Error("Can't find UtxO in the priceFeedOracle address")}
      const validatorAnchorUtxOs = allValidatorAnchorUtxOs.filter((utxo: UTxO) => {
        return utxo.txHash == dataStore.validatorAnchorTxHash;
      });
      //get mintingScriptRefUtxO with scriptref from validatorAnchor's address
      const mintingScriptRefUtxO = validatorAnchorUtxOs.find((utxo: UTxO) => {
        return utxo.outputIndex == 2;
      });
      if(!mintingScriptRefUtxO){throw new Error("Can't find mintingScriptRefUtxO in validatorAnchor's address")}
      const dUSDMintingScript = mintingScriptRefUtxO.scriptRef
      if(!dUSDMintingScript){throw new Error("Can't find script in the mintingScriptRefUtxO")}
      const dUSDMintingPolicyId : PolicyId = lucid.utils.mintingPolicyToId(dUSDMintingScript)

      //get utxos at collateralAddress
      const allCollateralUtxOs = await lucid.utxosAt(dataStore.collateralAddress);
      const collateralUtxOs = allCollateralUtxOs.filter((utxo: UTxO) => {
        const utxoDatum:CollateralDatum = Data.from(utxo.datum ? utxo.datum : "", CollateralDatum);
        console.log("utxoDatum")
        console.log(utxoDatum)
        return utxoDatum.colMintingPolicyId == dUSDMintingPolicyId;
      })
      console.log(collateralUtxOs)

      const vaultUTxOs : VaultUTxO[] = collateralUtxOs.map(a => ({
        address:  a.address.substring(0,15)+"..."+a.address.substring(50), 
        lovelace: a.assets.lovelace.toString(),
        collRatio: (
          console.log("a.assets.lovelace"),
          console.log(a.assets.lovelace),
          console.log(dataStore.currentADAPrice),
          console.log((Data.from(a.datum ? a.datum : "", CollateralDatum) as CollateralDatum).colStablecoinAmount),
          Math.round(
            Number(a.assets.lovelace) 
            * Number(dataStore.currentADAPrice) * Number(100)
            / Number((Data.from(a.datum ? a.datum : "", CollateralDatum) as CollateralDatum).colStablecoinAmount)
            / Number(1000000)
          )).toFixed(2).toString() + " %",
        stablecoinAmount: (Data.from(a.datum ? a.datum : "", CollateralDatum) as CollateralDatum).colStablecoinAmount.toString() + " dUSD",
        txHash: a.txHash, 
        outputIndex: a.outputIndex.toString()
      }))
      console.log(vaultUTxOs)
      dataStore.vaultUTxOs = vaultUTxOs
      setRefresh(!refresh); // This forces a re-render
    }
  }

// *********************** VAULT TABLE **********************
  // *************************************************************
  const [columnVisibility, setColumnVisibility] = useState({
    txHash: false,
    outputIndex: false
  });

  const table = useReactTable({
        state: {
          columnVisibility
        },
        columns: userColumnDefsUTxO,
        data: dataStore.vaultUTxOs,
        getCoreRowModel: getCoreRowModel(),
      })

  const headers = table.getFlatHeaders()
  const rows = table.getRowModel().rows;

  return (
    <div className="px-10">
      <Head>
        <title>Decentralized Stablecoin dUSD</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="navbar bg-base-100">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <Link href="/">
                <li><a>Welcome</a></li>
              </Link>
              <Link href="/helios">
                <li><a>App</a></li>
              </Link>
            </ul>
          </div>
        </div>      
        <div className="navbar-center">
          <div className="badge badge-secondary badge-outline">Decentralized Stablecoin dUSD</div>
        </div>  
        <div className="navbar-end">
          <div className="flex-none">
            <WalletConnect />
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full border-opacity-50">
        <div className="stats shadow">
    
          <div className="stat place-items-center">
            <div className="stat-title">Your wallet address</div>
            <div className="stat-value">{walletStore.address.substring(0,15)}...{walletStore.address.substring(100)}</div>
          </div>
          
          <div className="stat place-items-center">
            <div className="stat-title">Current ADA price</div>
            <div className="stat-value text-secondary">{dataStore.currentADAPrice}</div>
            <div className="stat-desc text-secondary">USD</div>
          </div>
          
        </div>
        <div className="divider">Administrator - Choose out of these options</div>
        <div className="flex flex-col w-full lg:flex-row">
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Log UTxOs</h2>
              <p>Log all UTxO information into the console</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary" onClick={() => { logUtxos() }}>Log</button>
              </div>
            </div>
          </div>
          <div className="divider lg:divider-horizontal">OR</div>
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Mint OracleNFT</h2>
              <p>Mint an OracleNFT to update the ADA pricefeed oracle</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary" onClick={() => { mintOracleNFT()}}>Mint</button>
              </div>
            </div>
          </div>
          <div className="divider lg:divider-horizontal">OR</div>
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Deploy Scripts</h2>
              <p>Deploy all necessary scripts as reference scripts</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary" onClick={() => { deployValidatorScripts() }}>Deploy</button>
              </div>
            </div>
          </div>
        </div>


        <div className="divider">Oracle-Provider - Choose out of these options</div>
        <div className="flex flex-col w-full lg:flex-row"> 
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Initialize ADA price</h2>
              <p>Initialize the current ADA price with the value of 1 USD, by updating the Pricefeed-Oracle</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary" onClick={() => { initPriceFeedOracle() }}>Initialize</button>
              </div>
            </div>
          </div>
          <div className="divider lg:divider-horizontal">OR</div> 
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Update ADA price</h2>
              <p>Update the current price of ADA</p>
              <label className="input input-bordered flex items-center gap-2">
                USD-Price
                <input type="text" className="grow" placeholder="0.5" onChange={(e) => { dataStore.newADAPrice = parseFloat(e.target.value)*100; console.log(dataStore.newADAPrice) }}/>
              </label>
              <div className="card-actions justify-end">
                <button className="btn btn-primary" onClick={() => {updatePriceFeedOracle()}}>Update</button>
              </div>
            </div>
          </div>
          <div className="divider lg:divider-horizontal">OR</div> 
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Refresh ADA price</h2>
              <p>Get the current ADA price from the PriceFeed Oracle</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary" onClick={() => { getCurrentADAPrice() }}>Refresh</button>
              </div>
            </div>
          </div>
        </div>

        <div className="divider">User - Mint or Burn Stablecoin dUSD</div>
        <div className="flex flex-col w-full lg:flex-row"> 
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Mint Stablecoin dUSD</h2>
              <p>Mint the specified amount of Stablecoin Token dUSD</p>
              <label className="input input-bordered flex items-center gap-2">
                Amount
                <input type="text" className="grow" placeholder="10.0" onChange={(e) => { dataStore.amountToMint = parseFloat(e.target.value); console.log(dataStore.amountToMint) }}/>
              </label>
              <div className="card-actions justify-end">
                <button className="btn btn-primary" onClick={() => { mintStablecoinTokens() }}>Mint</button>
              </div>
            </div>
          </div>
          <div className="divider lg:divider-horizontal">OR</div> 
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Burn Stablecoin dUSD</h2>
              <p>Burn the specified amount of Stablecoin Token dUSD</p>
              <label className="input input-bordered flex items-center gap-2">
                Amount
                <input type="text" className="grow" placeholder="10.0" onChange={(e) => { dataStore.amountToBurn = parseFloat(e.target.value); console.log(dataStore.amountToBurn) }}/>
              </label>
              <div className="card-actions justify-end">
                <button className="btn btn-primary" onClick={() => { burnStablecoinTokens() }}>Burn</button>
              </div>
            </div>
          </div>
          <div className="divider lg:divider-horizontal">OR</div> 
          <div className="card w-400 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Liquidate Vault</h2>
              <p>Try to liquidate undercollaterized vaults</p>
              <div className="card-actions justify-end">

              {/* The button to open modal */}
              <label htmlFor="my_modal_6" className="btn btn-primary">Show vaults</label>

              {/* Put this part before </body> tag */}
              <input type="checkbox" id="my_modal_6" className="modal-toggle" />
              <div className="modal">
                <div className="modal-box">
                <div className="flex flex-col w-full border-opacity-50">
                      <div className="stats shadow">
                  
                        <div className="stat place-items-center">
                          <div className="stat-title">Your wallet address</div>
                          <div className="stat-value">{walletStore.address.substring(0,15)}...{walletStore.address.substring(100)}</div>
                        </div>
                        
                        <div className="stat place-items-center">
                          <div className="stat-title">Current ADA price</div>
                          <div className="stat-value text-secondary">{dataStore.currentADAPrice}</div>
                          <div className="stat-desc text-secondary">USD</div>
                        </div>
                        
                      </div>
                      <div className="stats shadow">
                        <div className="stat place-items-center">
                          <div className="card w-600 bg-base-100 shadow-xl">
                            <div className="card-body">
                              <h2 className="card-title">Liquidate Vault</h2>
                              <p>Try to liquidate undercollaterized vaults (collateralization ratio fell below 150%)</p>
                              <div className="overflow-x-auto">
                                <table className="table table-zebra my-4 w-full">
                                  <thead>
                                      <tr>
                                        {headers.map((header) => {
                                          return (
                                            <th key={header.id}>
                                              {header.column.columnDef.enableHiding ? null : (
                                                <span>
                                                  {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                  )}
                                                </span>
                                              )}
                                            </th>
                                          );
                                        })}
                                        <th></th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {rows.map((row) => (
                                        <tr key={row.id}>
                                          {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id}>
                                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                          ))}
                                          <td>
                                            <button className="btn btn-error" onClick={() => {
                                              console.log(row.getValue("txHash"), row.getValue("outputIndex"))
                                              liquidateVault(row.getValue("txHash"), row.getValue("outputIndex"))
                                            }}>Liquidate</button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                </table>
                              </div>
                              <div className="card-actions justify-end">
                                <button className="btn btn-primary" onClick={() => { getVaultList() }}>Refresh list</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  <div className="modal-action">
                    <label htmlFor="my_modal_6" className="btn">Close!</label>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="divider">Liquidate Vault</div>
        <p>Try to liquidate undercollaterized vaults (collateralization ratio fell below 150%)</p>
        <div className="overflow-x-auto">
          <table className="table table-zebra my-4 w-full">
            <thead>
                <tr>
                  {headers.map((header) => {
                    return (
                      <th key={header.id}>
                        {header.column.columnDef.enableHiding ? null : (
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                        )}
                      </th>
                    );
                  })}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                    <td>
                      <button className="btn btn-error" onClick={() => {
                        console.log(row.getValue("txHash"), row.getValue("outputIndex"))
                        liquidateVault(row.getValue("txHash"), row.getValue("outputIndex"))
                      }}>Liquidate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>
        <div className="card-actions justify-end">
          <button className="btn btn-primary" onClick={() => { getVaultList() }}>Refresh list</button>
        </div>

        <div className="divider"></div>
        <footer className="footer p-10 bg-base-200 text-base-content">
        <nav>
          <h6 className="footer-title">Services</h6> 
          <a className="link link-hover">Branding</a>
          <a className="link link-hover">Design</a>
          <a className="link link-hover">Marketing</a>
          <a className="link link-hover">Advertisement</a>
        </nav> 
        <nav>
          <h6 className="footer-title">Company</h6> 
          <a className="link link-hover">About us</a>
          <a className="link link-hover">Contact</a>
          <a className="link link-hover">Jobs</a>
          <a className="link link-hover">Press kit</a>
        </nav> 
        <nav>
          <h6 className="footer-title">Legal</h6> 
          <a className="link link-hover">Terms of use</a>
          <a className="link link-hover">Privacy policy</a>
          <a className="link link-hover">Cookie policy</a>
        </nav> 
        <form>
          <h6 className="footer-title">Newsletter</h6> 
          <fieldset className="form-control w-80">
            <label className="label">
              <span className="label-text">Enter your email address</span>
            </label> 
            <div className="join">
              <input type="text" placeholder="username@site.com" className="input input-bordered join-item" /> 
              <button className="btn btn-primary join-item">Subscribe</button>
            </div>
          </fieldset>
        </form>
      </footer>
      <div className="divider"></div>
      </div>
    </div>
  )
}

export default Helios
