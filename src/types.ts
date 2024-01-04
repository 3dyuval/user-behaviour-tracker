type KeyboardEvents<T> = {
    keyboardEvents: {
        keydown: T;
        keyup: T;
    }
}

type MouseEvents<T> = {
    mouseEvents: {
        scroll: T;
        mouseenter: T;
        mousemove: T;
        click: T;
    }
}

type FormEvents<T> = {
    formEvents: {
        submit: T;
        change: T;
        focus: T;
        blur: T;
        input: T;
    }
}

type DragDropEvents<T> = {
    dragDropEvents: {
        dragenter: T;
        dragleave: T;
        dragstart: T;
        dragend: T;
        dragover: T;
        drop: T;
    }
}

type MediaEvents<T> = {
    mediaEvents: {
        play: T;
        pause: T;
        volumechange: T;
        ended: T;
        ratechange: T;
        seeked: T;
        timeupdate: T;
    }
}

type AnimationTransitionEvents<T> = {
    animationTransitionEvents: {
        animationstart: T;
        animationend: T;
        transitionend: T;
    }
}

type WindowEvents<T> = {
    windowEvents: {
        load: T;
        unload: T;
        beforeunload: T;
        resize: T;
        scroll: T;
    }
}

type Events<T> =
    KeyboardEvents<T>
    & MouseEvents<T>
    & FormEvents<T>
    & DragDropEvents<T>
    & MediaEvents<T>
    & AnimationTransitionEvents<T>
    & WindowEvents<T>


type TrackerSettings = {
    callback: (event?: Results) => void,
    callbackInterval: number,
    userInfo: boolean,
    clicks: boolean,
    mouseEvents: boolean,
    mouseEventsInterval: number, // in miliseconds
    timeCount: boolean,
    clearAfterProcess: boolean,
    processTime: number,
    processData: Function,
    debug: boolean
}

export type Config = Events<{ [key: string]: boolean | Function }> & TrackerSettings

export type Tracker = {
    running: boolean,
    showConfig: Function,
    config: Config,
    start: Function,
    stop: Function,
    current: Events<{ [key: string]: Map<any, any> }>,
    results: Results,
}

export type Results = {
        userInfo: {
            appCodeName: string;
            appName: string;
            vendor: string;
            platform: string;
            userAgent: string;
            screenWidth: number;
            screenHeight: number
        };
        time: {
            startTime: number;
            currentTime: number;
        };
    }
    & MouseEvents<Map<[number, number, number], HTMLElement>>
    & KeyboardEvents<Map<[string, number], HTMLElement>>
    & FormEvents<Map<[string, number], HTMLElement>>
    & DragDropEvents<Map<[string, number], HTMLElement>>
    & MediaEvents<Map<[string, number], HTMLElement>>
    & AnimationTransitionEvents<Map<[string, number], HTMLElement>>
    & WindowEvents<Map<[string, number], HTMLElement>>




export type AnalyzeResultsOptions = {
    openAiKey?: string
    screenCapture: boolean
    leadingElements: number
    pageContext?: string
}

export type AnalyzeResultsOutput = {
    raw: Results,
    insights: string,
    mouseEvents: MouseEvents<Array<[string, number]>>
    keyboardEvents: KeyboardEvents<Array<[string, number]>>
}
