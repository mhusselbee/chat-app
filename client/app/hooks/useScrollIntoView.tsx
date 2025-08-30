import { useRef, useEffect } from "react";

export default function useScrollIntoView(behavior: ScrollBehavior = "instant") {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: behavior });
        }
    }, [ref.current]);

    return ref;
};