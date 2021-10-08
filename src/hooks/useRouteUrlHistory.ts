import {useEffect, useState} from "react";
import {useRouter} from "next/router";

const EXCEPTIONS = ['/sign-up'];

const useRouteUrlHistory = () => {
    const [previousRoute, setPreviousRouter] = useState('');
    const router = useRouter();

    const handleBeforeHistoryChange = (url) => {
        const [nextUrl] = url?.split('?') || [];

        if (
            !(EXCEPTIONS.includes(nextUrl) || EXCEPTIONS.includes(router.asPath)) &&
            nextUrl !== router.asPath
        ) {
            setPreviousRouter(router.asPath);
        }
    };

    useEffect(() => {
        router.events.on('beforeHistoryChange', handleBeforeHistoryChange);

        return () => {
            router.events.off('beforeHistoryChange', handleBeforeHistoryChange);
        };
    }, []);

    return { previousRoute };
};

export default useRouteUrlHistory;
