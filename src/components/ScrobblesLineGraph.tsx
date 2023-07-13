import React, { useEffect, useState } from "react";
import { Chart, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import { Record, Scrobble } from "../utils/types";
import { topArtists } from "../data/data";
import { TimeRange, RecordType } from "../utils/types";
import { get_top_albums, get_top_artists, get_top_tracks } from "../controllers/lastfm";
import { Select, Skeleton } from "@chakra-ui/react";

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

const timeRangeMap: Map<string, TimeRange> = new Map([
    ["All Time", TimeRange.ALL_TIME],
    ["One Year", TimeRange.YEAR],
    ["Half Year", TimeRange.HALF_YEAR],
    ["3 Months", TimeRange.QUARTER],
    ["1 Month", TimeRange.ONE_MONTH],
    ["1 Week", TimeRange.ONE_WEEK],
]);

const recordTypeMap: Map<string, RecordType> = new Map([
    ["Artists", RecordType.ARTISTS],
    ["Albums", RecordType.ALBUMS],
    ["Tracks", RecordType.TRACKS]
]);

const calculateLineGraphData = (scrobbles: Scrobble[], top: string[], recordType: RecordType, timeRange: TimeRange) => {
    if (scrobbles.length === 0) return {labels: [], data: new Map()}
    // let data = [];
    let timestamps = [];
    let map = new Map();
    let data: Map<string, number[]> = new Map();
    for (const record of top) {
        map.set(record, 0);
        data.set(record, []);
    }
    const presentDate = parseInt(scrobbles[0].date.uts);
    const reverseScrobbles = [...scrobbles];
    reverseScrobbles.reverse();
    const startingDate = timeRange === TimeRange.ALL_TIME ? 
        parseInt(reverseScrobbles[0].date.uts) : 
        (presentDate - timeRangeAmounts.get(timeRange)!);
    timestamps.push(startingDate);
    const timeInterval = Math.floor((presentDate - startingDate) / 30);
    for (let [ record, playCount ] of map.entries())
        data.get(record)?.push(playCount)
    let curDateTarget = startingDate + timeInterval;
    
    for (let i = 0; i < reverseScrobbles.length; i++) {
        if (parseInt(reverseScrobbles[i].date.uts) > curDateTarget) {
            for (let [ record, playCount ] of map.entries())
                data.get(record)?.push(playCount)
            timestamps.push(curDateTarget);
            curDateTarget = Math.min(curDateTarget + timeInterval, presentDate);
        }
        if (recordType === RecordType.ARTISTS && map.has(reverseScrobbles[i].artist["#text"]))
            map.set(reverseScrobbles[i].artist["#text"], map.get(reverseScrobbles[i].artist["#text"]) + 1);
        else if (recordType === RecordType.ALBUMS && map.has(reverseScrobbles[i].album["#text"]))
            map.set(reverseScrobbles[i].album["#text"], map.get(reverseScrobbles[i].album["#text"]) + 1);
        else if (recordType === RecordType.TRACKS && map.has(reverseScrobbles[i].name))
            map.set(reverseScrobbles[i].name, map.get(reverseScrobbles[i].name) + 1);
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
    const [ isLoading, setIsLoading ] = useState(true);
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
            if (recordType === RecordType.ARTISTS) { 
                const data = await get_top_artists(props.username, timeRange);
                top = data.topartists.artist;
            }
            else if (recordType === RecordType.ALBUMS) {
                const data = await get_top_albums(props.username, timeRange);
                top = data.topalbums.album;
            }
            else if (recordType === RecordType.TRACKS) {
                const data = await get_top_tracks(props.username, timeRange);
                top = data.toptracks.track;
            }
            setTop(top.slice(0, 10).map(obj => obj.name));
        }
        setIsLoading(true);
        fetchTop()
        .catch(err => {
            console.log(err, "Error fetching top");
        });
        setIsLoading(false);
    }, [recordType]);

    const lineGraphData = calculateLineGraphData(props.scrobbles, top, recordType, timeRange);
    // setLoading(false);

    // if (isLoading) return null;

    return (
        <div>
            <Select
                onChange={e => setRecordType(recordTypeMap.get(e.target.value)!)}
                placeholder=""
            >
                <option value="Artists">Artists</option>
                <option value="Albums">Albums</option>
                <option value="Tracks">Tracks</option>
            </Select>
            <Select
                onChange={e => setTimeRange(timeRangeMap.get(e.target.value)!)}

            >
                <option value="All Time">All Time</option>
                <option value="One Year">One Year</option>
                <option value="Half Year">Half Year</option>
                <option value="3 Months">3 Months</option>
                <option value="1 Months">1 Months</option>
                <option value="1 Week">1 Week</option>
            </Select>
            <Skeleton isLoaded={!isLoading}>
            <Line
                data={{
                    labels: lineGraphData.labels.map(timestamp => new Date(timestamp * 1000).toDateString()),
                    datasets: top.map(record => {
                        return {
                            data: lineGraphData.data.get(record),
                            label: record
                        }
                    })
                }}
            />
            </Skeleton>
        </div>
    )
}