import React from "react"
import { Scrobble } from "../utils/types"

interface ScrobblesProps {
    scrobbles: Scrobble[]
}

const Scrobbles = (props: ScrobblesProps) => {
    return (
        <ul>
            {props.scrobbles.slice(1, 200).map(scrobble => {
                return <li>{scrobble.name} - {scrobble.artist["#text"]} - {scrobble.date["#text"]}</li>
            })}
        </ul>
    )
}



export default Scrobbles;