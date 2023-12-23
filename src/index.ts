import type { Config, Tracker, Results } from "~/types";


const noop = () => void 0;

export default function userBehavior(userConfig: Partial<Config> = {}) {

    const _resultsInitial: Results = {
        userInfo: {
            appCodeName: window?.navigator?.appCodeName || '',
            appName: window?.navigator?.appName || '',
            vendor: window?.navigator?.vendor || '',
            platform: window?.navigator?.platform || '',
            userAgent: window?.navigator?.userAgent || ''
        },
        time: { //todo
            startTime: 0,
            currentTime: 0
        },
        clicks: {
            clickCount: 0,
            clickDetails: []
        },
        mouseMovements: [],
        mouseScroll: [],
        contextChange: [] //todo
        //keyLogger: [], //todo
    }

    let _results: Results = _resultsInitial;
    let _running = false
    const controller = new AbortController()
    const { signal } = controller

    const intervals: any[] = []

    const config: Config = {
        userInfo: true,
        clicks: true,
        mouseMovement: true,
        mouseMovementInterval: 100,
        mouseScroll: true,
        mousePageChange: true, //todo
        timeCount: true,
        clearAfterProcess: true, // todo
        processTime: 15,
        processData: function (results: Results) {
            console.log(results);
        },
        ...userConfig
    };

    let mem = {
        processInterval: null,
        mouseInterval: null,
        mousePosition: [], //x,y,timestamp
        eventListeners: {
            scroll: null,
            click: null,
            mouseMovement: null
        },
        eventsFunctions: {
            scroll: () => {
                _results.mouseScroll.push([window.scrollX, window.scrollY, getTimeStamp()]);
            },
            click: (e: MouseEvent) => {
                _results.clicks.clickCount++;
                const path: string[]  = [];
                let node = "";
                e.composedPath().forEach((el , i) => {
                    if ((i !== e.composedPath().length - 1) && (i !== e.composedPath().length - 2)) {
                        node = el.localName;
                        (el.className !== "") ? el.classList.forEach((clE) => {
                            node += "." + clE
                        }): 0;
                        (el.id !== "") ? node += "#" + el.id: 0;
                        path.push(node);
                    }
                })
                _results.clicks.clickDetails.push([e.clientX, e.clientY, path.reverse().join(">"), getTimeStamp()]);
            },
            mouseMovement: (e: MouseEvent) => {
                mem.mousePosition = [e.clientX, e.clientY, getTimeStamp()];
            }
        }
    };



    const resetResults = () => {
        _results = _resultsInitial;
    }


    function getTimeStamp() {
        return Date.now();
    };


    function start() {

        _results = _resultsInitial;
        _running = true

        // TIME SET
        if (config.timeCount) {
            _results.time.startTime = getTimeStamp();
        }

        // MOUSE MOVEMENTS
        if (config.mouseMovement) {
            document.addEventListener("mousemove", mem.eventsFunctions.mouseMovement, { signal, passive: true });
            // intervals.push(
                setInterval(() => {
                // if (mem.mousePosition && mem.mousePosition.length) { //if data has been captured
                //     if (!_results.mouseMovements.length
                //         || ((mem.mousePosition[0] !== _results.mouseMovements[_results.mouseMovements.length - 1][0])
                //             && (mem.mousePosition[1] !== _results.mouseMovements[_results.mouseMovements.length - 1][1]))) {
                        _results.mouseMovements.push(mem.mousePosition)
                    // }
                // }
            }, config.mouseMovementInterval)
        // )
        }

        //CLICKS
        if (config.clicks) {
            document.addEventListener("click", mem.eventsFunctions.click, { signal });
        }

        //SCROLL
        if (config.mouseScroll) {
            document.addEventListener("scroll", mem.eventsFunctions.scroll, { signal });
        }

        //PROCESS INTERVAL
        // if (config.processTime !== false) {
        //     mem.processInterval = setInterval(() => {
        //         config.processData(result());
        //     }, config.processTime * 1000)
        // }
    };

    // function processResults() {
    //     config.processData?.(result());
    //     if (config.clearAfterProcess) {
    //         resetResults();
    //     }
    // }

    function stop() {

        controller.abort('User stopped')
        intervals.forEach(clearInterval)
        _running = false

    }

    // function result() {
    //     if (config.userInfo === false && userBehaviour.showResult().userInfo !== undefined) {
    //         delete userBehaviour.showResult().userInfo;
    //     }
    //     if (config.timeCount !== undefined && config.timeCount) {
    //         results.time.currentTime = getTimeStamp();
    //     }
    // };

    function showConfig() {
        return config;
    };

    return {
        get running() {
            return _running
        },
        get results() {
            if (config.timeCount) {
                _results.time.currentTime = getTimeStamp();
            }
            return _results
        },
        showConfig,
        config,
        start,
        stop,
    };


}
