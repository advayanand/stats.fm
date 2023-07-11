export interface Scrobble {
    artist: {
        mbid: string,
        "#text": string
    },
    streamable: string,
    image: Array<Object>
    mbid: string,
    album: {
        mbid: string,
        "#text": string
    },
    name: string,
    url: string,
    date: {
        uts: string,
        "#text": string
    },
    "@attr"?: {
        nowplaying: boolean
    }
}

export enum TimeRange {
    ALL_TIME,
    YEAR,
    HALF_YEAR,
    QUARTER,
    ONE_MONTH,
    ONE_WEEK,
}