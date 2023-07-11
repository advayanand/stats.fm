import React, { useEffect, useState } from "react";
import { Chart, registerables } from "chart.js";
import { Line } from "react-chartjs-2";

import { Record, Scrobble } from "../utils/types";
import { topArtists } from "../data/data";
import { TimeRange, RecordType } from "../utils/types";
import { get_top_albums, get_top_artists, get_top_tracks } from "../controllers/lastfm";

Chart.register(...registerables);

interface ScrobblesLineGraphProps {
    username: string
    scrobbles: Scrobble[]
}


const timeRangeAmounts: Map<TimeRange, number> = new Map([
    [TimeRange.YEAR, 3.156e+7],
    [TimeRange.HALF_YEAR, 1.577e+7],
    [TimeRange.QUARTER, 7.884e+6],
    [TimeRange.ONE_MONTH, 2.628e+6],
    [TimeRange.ONE_WEEK, 604800],
    [TimeRange.ALL_TIME, 0]
]);

const calculateLineGraphData = (scrobbles: Scrobble[], timeRange: TimeRange) => {
    if (scrobbles.length === 0) return {labels: [], data: new Map()}
    // let data = [];
    let timestamps = [];
    let map = new Map();
    let data: Map<string, number[]> = new Map();
    for (const artist of topArtists) {
        map.set(artist, 0);
        data.set(artist, []);
    }
    const presentDate = parseInt(scrobbles[0].date.uts);
    const reverseScrobbles = [...scrobbles];
    reverseScrobbles.reverse();
    const startingDate = timeRange === TimeRange.ALL_TIME ? 
        parseInt(reverseScrobbles[0].date.uts) : 
        (presentDate - timeRangeAmounts.get(timeRange)!);
    timestamps.push(startingDate);
    const timeInterval = Math.floor((presentDate - startingDate) / 30);
    for (let [ artist, playCount ] of map.entries())
        data.get(artist)?.push(playCount)
    let curDateTarget = startingDate + timeInterval;
    
    for (let i = 0; i < reverseScrobbles.length; i++) {
        if (parseInt(reverseScrobbles[i].date.uts) > curDateTarget) {
            for (let [ artist, playCount ] of map.entries())
                data.get(artist)?.push(playCount)
            timestamps.push(curDateTarget);
            curDateTarget = Math.min(curDateTarget + timeInterval, presentDate);
        }
        if (map.has(reverseScrobbles[i].artist["#text"]))
            map.set(reverseScrobbles[i].artist["#text"], map.get(reverseScrobbles[i].artist["#text"]) + 1);
    }

    console.log(timestamps, data);
    
    
    return {
        labels: timestamps,
        data: data
    }
}

interface ScrobblesLineGraphData {
    labels: number[],
    data: Map<string, number[]>
}

export const ScrobblesLineGraph = (props: ScrobblesLineGraphProps) => {
    const [ isLoading, setLoading ] = useState(true);
    // const [ data, setData ] = useState<Map<string, number[]>>(new Map());
    // const [ labels, setLabels ] = useState<number[]>([]);
    const [ timeRange, setTimeRange ] = useState<TimeRange>(TimeRange.ALL_TIME);
    const [ recordType, setRecordType ] = useState<RecordType>(RecordType.ARTISTS);
    const [ top, setTop ] = useState<string[]>([]);

    // useEffect(() => {
    //     const res = calculateLineGraphData(props.scrobbles, TimeRange.ALL_TIME);
    //     setData(res.data);
    //     setLabels(res.labels);
    //     setLoading(false);
    // }, []);

    useEffect(() => {
        const fetchTop = async () => {
            let top: Record[] = [];
            if (recordType === RecordType.ARTISTS)
                top = await get_top_artists(props.username, timeRange);
            else if (recordType === RecordType.ALBUMS)
                top = await get_top_albums(props.username, timeRange);
            else if (recordType === RecordType.TRACKS)
                top = await get_top_tracks(props.username, timeRange);
            setTop(top.slice(0, 10).map(obj => obj.name));
        }

        fetchTop()
        .catch(err => {
            console.log(err, "Error fetching top");
        });
    }, [recordType]);

    const lineGraphData = calculateLineGraphData(props.scrobbles, timeRange);
    // setLoading(false);

    // if (isLoading) return null;

    return (
        <div>
            <Line
                data={{
                    labels: lineGraphData.labels.map(timestamp => new Date(timestamp * 1000).toDateString()),
                    datasets: topArtists.map(artist => {
                        return {
                            data: lineGraphData.data.get(artist),
                            label: artist
                        }
                    })
                }}
            />
        </div>
    )
}