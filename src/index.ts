import { Config, Tracker, Metadata, AllEventFrames, TrackerSettings} from "./types";
import { fromEvent, map, mergeMap, throttle, throttleTime } from 'rxjs'
import ScrollEvent = JQuery.ScrollEvent
import { Events } from './types'


const noop = () => void 0;
const id = (x: any) => x;

export default class UserBehavior {
    public config: Config
    public _frames: AllEventFrames
    private _metadata: Metadata
    private _running = false
    private _eventTypes = new Map()
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
        this._metadata = {
            url: window?.location?.href || '',
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
        }
        this._frames = {
            mouseEvents: {
                scroll: new Map(),
                mousemove: new Map(),
                mouseenter: new Map(),
                click: new Map()
            },
            keyboardEvents: {
                keydown: new Map(),
                keyup: new Map()
            },
            formEvents: {
                submit: new Map(),
                change: new Map(),
                input: new Map(),
                focus: new Map(),
                blur: new Map()
            },
            dragDropEvents: {
                dragstart: new Map(),
                dragend: new Map(),
                dragenter: new Map(),
                dragleave: new Map(),
                dragover: new Map(),
                drop: new Map()
            },
            mediaEvents: {
                play: new Map(),
                pause: new Map(),
                ended: new Map(),
                volumechange: new Map(),
                ratechange: new Map(),
                seeked: new Map(),
                timeupdate: new Map()
            },
            animationTransitionEvents: {
                animationstart: new Map(),
                animationend: new Map(),
                transitionend: new Map()
            },
            windowEvents: {
                load: new Map(),
                unload: new Map(),
                beforeunload: new Map(),
                resize: new Map(),
                scroll: new Map()
            }
        }
    }


    private getTimeStamp() {
        return Date.now();
    };


    private CaptureFrame(event: Event): [number, { element: HTMLElement; event: Event; path: string }] {
        return [this.getTimeStamp(), { element: event.target as HTMLElement, event: event, path: this.composePath(event) }]
    }


    public start(userConfig: Partial<Config> = {}) {

        this.config = {
            ...this.config,
            ...userConfig
        }

        this._running = true

        // TIME SET
        if (this.config.timeCount) {
            this._metadata.time.startTime = this.getTimeStamp();
        }

        // MOUSE MOVEMENTS
        if (this.config.mouseEvents) {
            this.capture('mouseEvents', this.config.mouseEvents)
        }

        // KEYBOARD EVENTS
        if (this.config.keyboardEvents) {
            this.capture('keyboardEvents', this.config.keyboardEvents)
        }

        // FORM EVENTS
        if (this.config.formEvents) {
            this.capture('formEvents', this.config.formEvents)
        }

        // DRAG DROP EVENTS
        if (this.config.dragDropEvents) {
            this.capture('dragDropEvents', this.config.dragDropEvents)
        }

        // MEDIA EVENTS
        if (this.config.mediaEvents) {
            this.capture('mediaEvents', this.config.mediaEvents)
        }

        // ANIMATION TRANSITION EVENTS
        if (this.config.animationTransitionEvents) {
            this.capture('animationTransitionEvents', this.config.animationTransitionEvents)
        }

        // WINDOW EVENTS
        if (this.config.windowEvents) {
            this.capture('windowEvents', this.config.windowEvents)
        }

        // PROCESS CALLBACK
        this.intervals.push(setInterval(() => {
            this.config.callback(this.results)
        }, this.config.callbackInterval))
    };


    private capture(groupKey, group) {
        for ( const [eventKey, option ] of Object.entries(group))  {
                const all = this._eventTypes.get(groupKey)

                if (all) {
                    all[eventKey] = option
                } else {
                    this._eventTypes.set(groupKey, {
                        [eventKey]: option
                    })
                }

                const [before = id, after = id] = [option.before, option.after]


                this.intervals.push(
                    fromEvent(document, eventKey)
                        .pipe(
                            throttleTime(this.config.mouseEventsInterval),
                            map(before),
                            map((e) => this.CaptureFrame(e)),
                        ).subscribe((e) => {
                        this._frames[groupKey][eventKey].set(...e)
                    })
                );

        }
    }


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
            this._metadata.time.currentTime = this.getTimeStamp();
        }
        return this.analyzeResults()
    }


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


    public analyzeResults(options: Partial<any> = {}): any {


        // NEXT
        // client:  sends leading nodes to server with page metadata
        // server:  walk the tree non-deterministicly starting from leading nodes
        //
        const result = {}

        this._eventTypes.forEach(( keys, groupKey ) => {

            result[groupKey] = {}

            for (const [eventKey, option] of Object.entries(keys)) {
                result[groupKey][eventKey] = []
                const after = typeof option.after === 'function' ? option.after : id
                for (const [timestamp, frame] of this._frames[groupKey][eventKey].entries())

                    result[groupKey][eventKey].push({[timestamp]: { ...frame, ...after(frame)}})
            }
        })

            //
            //
            // const groupByElement = {}
            //
            // for (const [eventKey, efm] of Object.entries(this._frames[eventsGroup])) {
            //
            //     const { after = id } = this._eventsGroup.get(eventsGroup)[eventKey].after
            //
            //     groupByElement[eventKey] = Object.groupBy(efm, ([timestamp, { element, event, path }]) => {
            //         return path
            //     })
            // }
            //
            // const groupByTimeline = {}
            //
            // for (const [eventKey, efm] of Object.entries(this._frames[eventsGroup])) {
            //     groupByTimeline[eventKey] = Object.groupBy(efm, ([timestamp, { element, event, path }]) => {
            //         return timestamp
            //     })
            // }
            //
            //  acc[eventsGroup] = {
            //     groupByElement,
            //     groupByTimeline
            // }

        return result
    }

    async getInsights(options: Partial<AnalyzeResultsOptions> = {}) {

        // implement non-deterministic analysis
        // everything here needs to move to the server

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
            raw: this._frames,
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
        this._eventsGroup = []

        return this.results
    }


}
