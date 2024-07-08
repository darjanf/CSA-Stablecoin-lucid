import { Blockfrost, Lucid } from 'lucid-cardano';

const initLucid = async (wallet: string) => {
    const api = (await window.cardano[
        wallet.toLowerCase()
    ].enable())

    // const nami = await window.cardano.nami.enable();
    // const eternl = window.cardano.eternl.enable();
    // const gero = await window.cardano.gero.enable();
    
    const lucid = await Lucid.new(
        new Blockfrost('https://cardano-preview.blockfrost.io/api/v0', process.env.NEXT_PUBLIC_BLOCKFROST as string)
        ,'Preview')
    lucid.selectWallet(api)
    //setLucid(lucid)
    return lucid;
}


export default initLucid;