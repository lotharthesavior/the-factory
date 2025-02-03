export type AssetState = {
    name: string,
    count: number,
}

type AssetProps = {
    assets: AssetState[];
}

export function Assets({ assets }: AssetProps) {
    return (
        <>
            <h2>Assets:</h2>
            <ul>{ assets.map((asset: AssetState, index: number) => {
                return <li key={index}>{asset.name}: {asset.count}</li>
            }) }</ul>
        </>
    )
}