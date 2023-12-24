export type Config = {
    callback: (event?: Results) => void,
    callbackInterval: number,
    userInfo: boolean,
    clicks: boolean,
    mouseMovement: boolean,
    mouseMovementInterval: number, // in miliseconds
    mouseScroll: boolean,
    mousePageChange: boolean,
    timeCount: boolean,
    clearAfterProcess: boolean,
    processTime: number,
    processData: Function,
}


export type Tracker = {
    running: boolean,
    showConfig: Function,
    config: Config,
    start: Function,
    stop: Function,
    results: Results,
}

export type Results = {
    userInfo: {
        appCodeName: string,
        appName: string,
        vendor: string,
        platform: string,
        userAgent: string,
        screenWidth: number,
        screenHeight: number
    },
    time: {
        startTime: number,
        currentTime: number,
    },
    scroll: Array<[number, number, number]>
    move: Array<[number, number, number]>
    clicks: Array<any>,
    clicksCount: number,
    contextChange: Array<any>,
    keyLogger: Array<any>,
}

export type AnalyzeResultsOptions = {
    openAiKey?: string
    screenCapture: boolean
    leadingClicks: number
}

export type AnalyzeResultsOutput = {
    raw: Results,
    insights: string,
    leadingClickPaths: Array<[string, unknown]>,
}