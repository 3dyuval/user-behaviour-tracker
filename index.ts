export default function userBehavior (userConfig: any = {}) {

    const config = {
        userInfo: true,
        clicks: true,
        mouseMovement: true,
        mouseMovementInterval: 1,
        mouseScroll: true,
        mousePageChange: true, //todo
        timeCount: true,
        clearAfterProcess: true, // todo
        processTime: 15,
        processData: function (results) {
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
            mouseMovement: null,
        },
        eventsFunctions: {
            scroll: () => {
                results.mouseScroll.push([window.scrollX, window.scrollY, getTimeStamp()]);
            },
            click: (e) => {
                results.clicks.clickCount++;
                let path = [];
                let node = "";
                e.composedPath().forEach((el, i) => {
                    if ((i !== e.composedPath().length - 1) && (i !== e.composedPath().length - 2)) {
                        node = el.localName;
                        (el.className !== "") ? el.classList.forEach((clE) => {
                            node += "." + clE
                        }): 0;
                        (el.id !== "") ? node += "#" + el.id: 0;
                        path.push(node);
                    }
                })
                path = path.reverse().join(">");
                results.clicks.clickDetails.push([e.clientX, e.clientY, path, getTimeStamp()]);
            },
            mouseMovement: (e) => {
                mem.mousePosition = [e.clientX, e.clientY, getTimeStamp()];
            }
        }
    };
    let results = {};

    function resetResults() {
        results = {
            userInfo: {
                appCodeName: navigator.appCodeName || '',
                appName: navigator.appName || '',
                vendor: navigator.vendor || '',
                platform: navigator.platform || '',
                userAgent: navigator.userAgent || ''
            },
            time: { //todo
                startTime: 0,
                currentTime: 0,
            },
            clicks: {
                clickCount: 0,
                clickDetails: []
            },
            mouseMovements: [],
            mouseScroll: [],
            contextChange: [], //todo
            //keyLogger: [], //todo

        }
    };
    resetResults();

    function getTimeStamp() {
        return Date.now();
    };


    function start() {

        // TIME SET
        if (config.timeCount !== undefined && config.timeCount) {
            results.time.startTime = getTimeStamp();
        }
        // MOUSE MOVEMENTS
        if (config.mouseMovement) {
            mem.eventListeners.mouseMovement = window.addEventListener("mousemove", mem.eventsFunctions.mouseMovement);
            mem.mouseInterval = setInterval(() => {
                if (mem.mousePosition && mem.mousePosition.length) { //if data has been captured
                    if (!results.mouseMovements.length || ((mem.mousePosition[0] !== results.mouseMovements[results.mouseMovements.length - 1][0]) && (mem.mousePosition[1] !== results.mouseMovements[results.mouseMovements.length - 1][1]))) {
                        results.mouseMovements.push(mem.mousePosition)
                    }
                }
            }, config.mouseMovementInterval * 1000);
        }
        //CLICKS
        if (config.clicks) {
            mem.eventListeners.click = window.addEventListener("click", mem.eventsFunctions.click);
        }
        //SCROLL
        if (config.mouseScroll) {
            mem.eventListeners.scroll = window.addEventListener("scroll", mem.eventsFunctions.scroll);
        }
        //PROCESS INTERVAL
        if (config.processTime !== false) {
            mem.processInterval = setInterval(() => {
                config.processData(result());
            }, config.processTime * 1000)
        }
    };

    function processResults() {
        config.processData(result());
        if (config.clearAfterProcess) {
            resetResults();
        }
    }

    function stop() {
        if (config.processTime !== false) {
            clearInterval(mem.processInterval);
        }
        clearInterval(mem.mouseInterval);
        window.removeEventListener("scroll", mem.eventsFunctions.scroll);
        window.removeEventListener("click", mem.eventsFunctions.click);
        window.removeEventListener("mousemove", mem.eventsFunctions.mouseMovement);
    }

    function result() {
        if (config.userInfo === false && userBehaviour.showResult().userInfo !== undefined) {
            delete userBehaviour.showResult().userInfo;
        }
        if (config.timeCount !== undefined && config.timeCount) {
            results.time.currentTime = getTimeStamp();
        }
        return results
    };

    function showConfig() {
            return config;
    };

    return {
        showConfig,
        config,
        start,
        stop,
        showResult: result,
        processResults,
    };

}
