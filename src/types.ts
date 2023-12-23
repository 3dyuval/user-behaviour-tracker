export type Config = {
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

export  type Results = {
    userInfo: {
        appCodeName: string,
        appName: string,
        vendor: string,
        platform: string,
        userAgent: string,
    },
    time: {
        startTime: number,
        currentTime: number,
    },
    clicks: {
        clickCount: number,
        clickDetails: Array<any>,
    },
    mouseMovements: Array<any>,
    mouseScroll: Array<any>,
    contextChange: Array<any>,
    //keyLogger: Array<any>,
}