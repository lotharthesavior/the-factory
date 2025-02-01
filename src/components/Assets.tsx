import { Asset, AssetTypes } from "./Store"


type AssetProps = {
    assets: Asset[];
}

export function Assets({ assets }: AssetProps) {
    const presentAssets = () => Object.keys(AssetTypes).map((assetName: string) => {
        const assetCount: number = assets.filter((asset: Asset) => asset.name === AssetTypes[assetName].name).length
        if (assetCount === 0) return null
        return <li key={AssetTypes[assetName].name}>{AssetTypes[assetName].name}: {assetCount}</li>
    })

    return (
        <>
            <h2>Assets:</h2>
            <ul>{presentAssets()}</ul>
        </>
    )
}