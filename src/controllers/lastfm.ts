import axios, { all } from "axios";
// import { log } from "console";
// import * as fs from 'fs';

import { Scrobble } from "../utils/types";
import { TimeRange } from "../utils/types";
import { timeRangePeriodStr } from "../utils/utils";
import { secrets } from "../secrets/secrets";

const get_top_artists = async (username: string, period: TimeRange) => {
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${username}&api_key=${secrets.LASTFM_API_KEY}&period=${timeRangePeriodStr.get(period)}&format=json&page=1`
    const res = await axios.get(url);
    return res.data;
}

const get_top_albums = async (username: string, period: TimeRange) => {
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${username}&api_key=${secrets.LASTFM_API_KEY}&period=${timeRangePeriodStr.get(period)}&format=json&page=1`
    const res = await axios.get(url);
    return res.data;
}

const get_top_tracks = async (username: string, period: TimeRange) => {
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${username}&api_key=${secrets.LASTFM_API_KEY}&period=${timeRangePeriodStr.get(period)}&format=json&page=1`
    const res = await axios.get(url);
    return res.data;
}

const get_all_scrobbles_page = async (username: string, page: number) => {
    const url = `https://us-east4-statsfm-391801.cloudfunctions.net/get_scrobbles?username=${username}&page=${page}`;
    const url2 = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${secrets.LASTFM_API_KEY}&format=json&page=${page}&limit=200`;
    const res = await axios.get(url);
    return res.data;
}

const write = (arr: Scrobble[]) => {
    arr.forEach(obj => {
        const str = `${obj.name} - ${obj.artist["#text"]}\n`;
        // fs.writeFileSync('tracks.txt', str, { flag: 'a' });
    })
}

const writeJson =(arr: Scrobble[]) => {
    const json = JSON.stringify(arr)
    // fs.writeFileSync('tracks.json', json, { flag: 'a' });
}

const extend_scrobbles_list = (allScrobbles: Scrobble[], newScrobbles: Scrobble[]) => {
    if (newScrobbles[0]["@attr"]?.nowplaying)
        newScrobbles.shift();
    allScrobbles.push(...newScrobbles)
}

const retry: (fn: () => Promise<any>, maxRetries: number, err?:any) => Promise<any> = (fn: () => Promise<any>, maxRetries: number, err=null) => {
    if (maxRetries === 0)
        return Promise.reject(err);
    return fn().then(val => Promise.resolve(val)).catch(err => {
        console.error(`Error fetching page, retrying... (${maxRetries - 1} tries left)`);
        return retry(fn, maxRetries - 1, err);
    });
}

const get_all_scrobbles = async (username: string, pageLoadCallback: Function, totalPagesCallback: Function) => {
    const data = await get_all_scrobbles_page(username, 1);
    const recentTracks = data.recenttracks;
    const totalPages: number = recentTracks["@attr"].totalPages;
    const allScrobbles: Scrobble[] = []
    totalPagesCallback(totalPages);
    pageLoadCallback();
    extend_scrobbles_list(allScrobbles, recentTracks.track);
    // log(1, "page of", totalPages);
    let pagesDone = 1;
    const prom = Array.from({length: totalPages - 1}, (_, i) => i + 2).map(page => {
        return retry(() => get_all_scrobbles_page(username, page), 3)
        .then(val => {
            pagesDone++;
            pageLoadCallback();
            return val;
        })
        .catch(err => {
            console.error(`Error fetching page ${page}: ${err}`);
        });
    });
    const all_promises = await Promise.all(prom);
    all_promises.forEach(item => {
        // write(arr);
        extend_scrobbles_list(allScrobbles, item.recenttracks.track)
    });
    // log(allScrobbles.length);
    // fs.openSync('tracks.txt', 'w'); // clear file
    // writeJson(allScrobbles);
    // write(allScrobbles);
    return allScrobbles;
}

export {
    get_all_scrobbles,
    get_top_artists,
    get_top_albums,
    get_top_tracks
};

// export type Scrobble;