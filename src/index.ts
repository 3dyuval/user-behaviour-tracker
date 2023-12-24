import { Config, Tracker, Results, AnalyzeResultsOptions, AnalyzeResultsOutput } from "~/types";
import { fromEvent, throttle, throttleTime } from 'rxjs'
import ScrollEvent = JQuery.ScrollEvent



const noop = () => void 0;

export default class UserBehavior {
    public config: Config
    public _results: Results
    private _running = false
    private controller = new AbortController()
    private signal = this.controller.signal
    private intervals: any[] = []
    private count = 0

    constructor(userConfig: Partial<Config> = {}) {
        this.config = {
            callback: noop,
            userInfo: true,
            clicks: true,
            mouseMovement: true,
            mouseMovementInterval: 100,
            mouseScroll: true,
            mousePageChange: true, //todo
            timeCount: true,
            clearAfterProcess: true, // todo
            processTime: 15,
            ...userConfig
        }
        this._results = {
            userInfo: {
                appCodeName: window?.navigator?.appCodeName || '',
                appName: window?.navigator?.appName || '',
                vendor: window?.navigator?.vendor || '',
                platform: window?.navigator?.platform || '',
                userAgent: window?.navigator?.userAgent || '',
                screenWidth: window?.innerWidth || 0,
                screenHeight: window?.innerHeight || 0,
            },
            time: {
                startTime: 0,
                currentTime: 0
            },
            contextChange: [],
            move: [],
            clicks: [],
            clicksCount: 0,
            scroll: [],
            keyLogger: []
        }
    }


    private getTimeStamp() {
        return Date.now();
    };


    private move(e: MouseEvent) {
        this._results.move.push([e.offsetX, e.offsetY, this.getTimeStamp()])
    }


    private click(e: MouseEvent) {
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


    private scroll(e: ScrollEvent) {
        this._results.scroll.push([e.pageX, e.pageY, this.getTimeStamp()])
    }


    public clear() {
        this._results = {
            userInfo: {
                appCodeName: window?.navigator?.appCodeName || '',
                appName: window?.navigator?.appName || '',
                vendor: window?.navigator?.vendor || '',
                platform: window?.navigator?.platform || '',
                userAgent: window?.navigator?.userAgent || '',
                screenWidth: window?.innerWidth || 0,
                screenHeight: window?.innerHeight || 0,
            },
            time: {
                startTime: 0,
                currentTime: 0
            },
            contextChange: [],
            move: [],
            clicks: [],
            clicksCount: 0,
            scroll: [],
            keyLogger: []
        }
    }

    public start(userConfig: Partial<Config> = {}) {

        this.config = {
            ...this.config,
            ...userConfig
        }

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


        // SCROLL
        if (this.config.mouseScroll) {
            fromEvent<MouseEvent>(document, 'scroll')
                .pipe(throttleTime(this.config.mouseMovementInterval))
                .subscribe((e) => this.scroll(e))
        }

        // PROCESS CALLBACK
        this.intervals.push(setInterval(() => {
            this.config.callback(this.results)
        }, this.config.callbackInterval))
    };


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




    public async analyzeResults(options: Partial<AnalyzeResultsOptions> = {}): Promise<AnalyzeResultsOutput> {

        const _options: AnalyzeResultsOptions = {
            screenCapture: false,
            ...options,
            leadingClicks: 5,
        }

        if (!this.results.clicks.length) return Promise.reject('No clicks')


        const leadingClicksCount = this.results.clicks.reduce((acc, [x, y, path, time]) => {
            if (acc[path]) {
                acc[path]++
            } else {
                acc[path] = 1
            }
            return acc
        }, {} as { [key: string]: number })

        const sortedClicks = Object.entries(leadingClicksCount)
            .toSorted((a, b) => (b[1] as number) - (a[1] as number))

        const leadingClickPaths = sortedClicks.slice(0, _options.leadingClicks)

        let insights = 'Please provide openAiKey to generate insights'

        if (_options.openAiKey) {
           const response =  await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${_options.openAiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {"role": "system", "content": "You are provided a single user session click summary in this form: [element>path>to>clickedElement:clicksCount]"},
                        {"role": "user", "content": `What can I learn from this interaction? Is there something to improve? ${leadingClickPaths.map(([path, count]) => path).join(', ')}`},
                    ],
                    temperature: 0.7
                })
            }).then((res) => res.json())

            insights = response?.choices?.[0]?.message?.content
        }

        return Promise.resolve({
                raw: this._results,
                insights,
                leadingClickPaths
            })
    }

    public stop() {


        this.controller.abort('User stopped')
        this.intervals.forEach(clearInterval)
        this._running = false

        return this.results
    }


}
