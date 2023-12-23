import type { Config, Tracker, Results } from "~/types";
import { fromEvent, throttle, throttleTime } from 'rxjs'


const noop = () => void 0;

export default class UserBehavior {
    public config: Config
    public _results: Results
    private _running = false
    private controller = new AbortController()
    private signal = this.controller.signal
    private intervals: any[] = []
    private count =  0

    constructor(userConfig: Partial<Config> = {}) {
        this.config = {
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
        }
        this._results = {
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
            contextChange: [],
            move: [],
            clicks: [],
            clicksCount: 0,
            keyLogger: []
        }
    }

    // let mem = {
    //     mousePosition: [], //x,y,timestamp
    //     eventsFunctions: {
    //         scroll: () => {
    // _results.mouseScroll.push([window.scrollX, window.scrollY, getTimeStamp()]);
// }
    private click (e: MouseEvent) {
        this._results.clicksCount++
        const path: string[] = [];
        let node = "";
        e.composedPath().forEach((el, i) => {
            if ((i !== e.composedPath().length - 1) && (i !== e.composedPath().length - 2)) {
                node = el.localName;
                (el.className !== "") ? el.classList.forEach((clE) => {
                    node += "." + clE
                }) : 0;
                (el.id !== "") ? node += "#" + el.id : 0;
                path.push(node);
            }
        })
        this._results.clicks.push([e.clientX, e.clientY, path.reverse().join(">"), this.getTimeStamp()]);
    }
// }
// };


    private getTimeStamp() {
        return Date.now();
    };


    private move(e: MouseEvent) {
        this._results.move.push([e.clientX, e.clientY, this.getTimeStamp()])
    }

    public start() {
        this._running = true
        // TIME SET
        if (this.config.timeCount) {
            this._results.time.startTime = this.getTimeStamp();
        }

        // MOUSE MOVEMENTS
        if (this.config.mouseMovement) {
            fromEvent<MouseEvent>(document, 'mousemove')
                .pipe(throttleTime(this.config.mouseMovementInterval))
                .subscribe((e) => this.move(e))

        }

        //CLICKS
        if (this.config.clicks) {
            fromEvent<MouseEvent>(document, 'click')
                .pipe(throttleTime(this.config.mouseMovementInterval))
                .subscribe((e) => this.click(e))
        }

        //SCROLL
        // if (config.mouseScroll) {
        //     document.addEventListener("scroll", mem.eventsFunctions.scroll, { signal });
        // }

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


    public stop() {

        this.controller.abort('User stopped')
        this.intervals.forEach(clearInterval)
        this._running = false

        return this.results
    }

// function result() {
//     if (config.userInfo === false && userBehaviour.showResult().userInfo !== undefined) {
//         delete userBehaviour.showResult().userInfo;
//     }
//     if (config.timeCount !== undefined && config.timeCount) {
//         results.time.currentTime = getTimeStamp();
//     }
// };


    public get running() {
        return this._running
    }

    public set running(value: boolean) {
        if (value === true) {
            this.start()
        } else {
            this.stop();
        }
    }

    public get results() {
        if (this.config.timeCount) {
            this._results.time.currentTime = this.getTimeStamp();
        }
        return this._results
    }

}
