import React, { FormEvent } from "react";
import { Input, Center, Button, Progress } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { get_all_scrobbles } from "../controllers/lastfm";
import { Scrobble } from "../utils/types";
import Scrobbles from "../components/Scrobbles";
import { ScrobblesLineGraph } from "../components/ScrobblesLineGraph";

interface StatsPageProps {

}

// const clean = (scrobble: Scrobble) => {
//     scrobble.date.uts = parseInt(scrobble.date.uts);
// }

const StatsPage = (props: StatsPageProps) => {
    const [ scrobbles, setScrobbles ] = useState<Scrobble[]>([]);
    const [ username, setUsername ] = useState<string>('');
    const [ isLoading, setIsLoading ] = useState<boolean>(false);
    const [ pagesLoaded, setPagesLoaded ] = useState(0);
    const [ totalPages, setTotalPages ] = useState(-1); 

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const scrobbles = await get_all_scrobbles(
            username, 
            () => {
                setPagesLoaded(pagesLoaded => pagesLoaded + 1);
            }, 
            (totalPages: number) => {
                setTotalPages(totalPages);
            });
        setIsLoading(false);
        setScrobbles(scrobbles);
    }
    
    return (
        <div>
            <Center>
                <Input 
                    placeholder="last.fm username" 
                    width="50vw" 
                    // marginTop="30vh"
                    onChange={e => setUsername(e.target.value)}
                    onSubmit={onSubmit}/>
                <Button
                    colorScheme="teal"
                    variant="solid"
                    onClick={onSubmit}
                    isLoading={isLoading}
                >
                    Search
                </Button>
            </Center>
            {isLoading && totalPages > -1 &&
                <>
                {pagesLoaded} of {totalPages} pages loaded
                <Progress value={pagesLoaded / totalPages * 100}/>
                </>
            }
            {/* <Scrobbles scrobbles={scrobbles} /> */}
            {scrobbles.length > 0 && <ScrobblesLineGraph username={username} scrobbles={scrobbles} />}
        </div>
    )
}

export default StatsPage;
