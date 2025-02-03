import { AssetState } from "./Assets";
import { Asset, AssetTypes, getAssetPrice } from "./store-utils";

type StoreProps = {
    addAsset: (asset: Asset) => void;
    balance: number,
    assets: AssetState[],
}

export function AssetStore({ addAsset, balance, assets }: StoreProps) {
    return (
        <>
            <h2>Store</h2>
            <ul className="flex gap-4 m-auto">
                {Object.keys(AssetTypes).map((assetName: string, index: number) => {
                    const assetPrice: number = getAssetPrice(AssetTypes[assetName], assets.find((a) => a.name === assetName)?.count ?? 0 );
                    const buttonClass: string = "border border-gray-400 shadow rounded p-4 shadow flex flex-col items-center justify-center gap-2 " + ( balance < assetPrice ? " cursor-not-allowed bg-red-900" : " cursor-pointer" );

                    return (
                        <li key={index}>
                            <div
                                className={buttonClass}
                                onClick={() => addAsset(AssetTypes[assetName])}
                            >
                                <div className="w-full flex justify-center">{AssetTypes[assetName].icon}</div>
                                <div className="w-full text-center text-[10px] pt-2">(+ { AssetTypes[assetName].increment })</div>
                                <div className="w-full text-center text-[12px]">Cost: $ { assetPrice }</div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </>
    )
}