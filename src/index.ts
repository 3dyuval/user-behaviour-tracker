import { Config, Tracker, Results, AnalyzeResultsOptions, AnalyzeResultsOutput } from "./types";
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
            mouseEventsInterval: 100,
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
                screenHeight: window?.innerHeight || 0
            },
            time: {
                startTime: 0,
                currentTime: 0
            },
            mouseEvents: {
                scroll: new Map(),
                mousemove: new Map(),
                mouseenter: new Map(),
                click: new Map(),
            },
            keyboardEvents: {
                keydown: new Map(),
                keyup: new Map(),
            },
            formEvents: {
                submit: new Map(),
                change: new Map(),
                input: new Map(),
                focus: new Map(),
                blur: new Map(),
            },
            dragDropEvents: {
                dragstart: new Map(),
                dragend: new Map(),
                dragenter: new Map(),
                dragleave: new Map(),
                dragover: new Map(),
                drop: new Map(),
            },
            mediaEvents: {
                play: new Map(),
                pause: new Map(),
                ended: new Map(),
                volumechange: new Map(),
                ratechange: new Map(),
                seeked: new Map(),
                timeupdate: new Map(),
            },
            animationTransitionEvents: {
                animationstart: new Map(),
                animationend: new Map(),
                transitionend: new Map(),
            },
            windowEvents: {
                load: new Map(),
                unload: new Map(),
                beforeunload: new Map(),
                resize: new Map(),
                scroll: new Map(),
            },
        }
    }


    private getTimeStamp() {
        return Date.now();
    };


    private composePath(e: Event) {
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

        return path.reverse().join(">")
    }

    private captureMouseFrame(e: MouseEvent) {
        return [e.clientX, e.clientY, this.composePath(e), this.getTimeStamp()]
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
        if (this.config.mouseEvents) {
            for (const key in this._results.mouseEvents) {
                this.intervals.push(
                    fromEvent<MouseEvent>(document, key)
                        .pipe(
                            throttleTime(this.config.mouseEventsInterval)
                        ).subscribe((e) => {
                            this._results.mouseEvents[key]
                                .set(
                                    this.captureMouseFrame(e),
                                    <HTMLElement>e.target
                                )
                        }));
            }
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
        return this.analyzeResults()
    }


    public analyzeResults(options: Partial<AnalyzeResultsOptions> = {}): AnalyzeResultsOutput['mouseEvents'] {

        const _options: AnalyzeResultsOptions = {
            screenCapture: false,
            pageContext: undefined,
            leadingElements: 5,
            ...options
        }


        const countLead = (source: Array<[x: number, y: number, path: string, time: number]>) => source.reduce((acc, [x, y, path, time]) => {
            if (acc[path]) {
                acc[path]++
            } else {
                acc[path] = 1
            }
            return acc
        }, {} as { [key: string]: number })


        const sortElemented = source => source.toSorted((a, b) => (b[1] as number) - (a[1] as number))

        const cullElements = source => source.slice(0, _options.leadingElements)

        const mouseEvents: Partial<AnalyzeResultsOutput['mouseEvents']> = {}

        for (const key in this._results.mouseEvents) {
            const frame = Array.from(this._results.mouseEvents[key].keys())
            const step1 = countLead(frame)
            const step2 = Object.entries(step1)
            const step3 = sortElemented(step2)
            const step4 = cullElements(step3)
            mouseEvents[key] = step4
        }

        return mouseEvents as AnalyzeResultsOutput['mouseEvents']
    }

    async getInsights(options: Partial<AnalyzeResultsOptions> = {}) {

        // if (!this.results.click.length) return Promise.reject('No click')


        const leadingElements = this.analyzeResults(options)

        let insights = 'Please provide openAiKey to generate insights'

        if (options.openAiKey) {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${options.openAiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            "role": "system",
                            "content": "You are provided a single user session click summary with this form: {[mouseEvent: 'click' | 'move' | 'over' | 'scroll' ]: [elementPath: element>path>to>clickedElement: clickCount: integer]}"
                        },
                        // { "role": "user", "content": `This is the page context: ${options.pageContext}` },
                        {
                            "role": "user",
                            "content": `What can I learn from this interaction? Is there something to improve? ${JSON.stringify(leadingElements)}`
                        }
                    ],
                    temperature: 0.7
                })
            }).then((res) => res.json())

            insights = response?.choices?.[0]?.message?.content
        }

        return Promise.resolve({
            raw: this._results,
            insights,
            leadingElements
        })
    }


    public stop() {


        this.controller.abort('User stopped')
        this.intervals.forEach(interval => {
            if (typeof interval === 'object' && 'unsubscribe' in interval) {
                interval.unsubscribe()
            } else {
                clearInterval(interval)
            }
        })
        this._running = false

        return this.results
    }


}
