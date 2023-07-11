export interface Scrobble {
    artist: {
        mbid: string,
        "#text": string
    },
    streamable: string,
    image: Object[]
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

export interface Record {
    artist: {
        mbid: string,
        "#text": string,
        url?: string
    },
    image: Object[]
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
    playcount: string
    "@attr"?: {
        rank: string
    },
    streamable?: string | Object,
}

export enum TimeRange {
    ALL_TIME,
    YEAR,
    HALF_YEAR,
    QUARTER,
    ONE_MONTH,
    ONE_WEEK,
}

export enum RecordType {
    ARTISTS,
    ALBUMS,
    TRACKS,
}
