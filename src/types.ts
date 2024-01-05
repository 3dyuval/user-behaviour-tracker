
//products
type Frame = [number, { element: HTMLElement; event: Event; }]


// utils
export type EventFrames <T> = Map<string, T>
export type CallbackListener = <T>(args: T) => T | (<T>(frame: Frame) => Frame & T);
type AllEvents <K> = KeyboardEvents<K> & MouseEvents<K> & FormEvents<K> & DragDropEvents<K> & MediaEvents<K> & AnimationTransitionEvents<K> & WindowEvents<K>

export type AllEventFrames = AllEvents<Map<string, any>>
export type Option = boolean | { before?: CallbackListener; after?: CallbackListener}

export type Config = Partial<AllEvents<Option>> & TrackerSettings

export type TrackerSettings = {
    callback: (event?: Events & Metadata) => void,
    callbackInterval: number,
    userInfo: boolean,
    clicks: boolean,
    mouseEvents: boolean,
    mouseEventsInterval: number, // in miliseconds
    timeCount: boolean,
    clearAfterProcess: boolean,
    processTime: number,
    processData: Function,
    debug?: boolean
}

export type Metadata = {
    url: string;
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

type Events = & KeyboardEvents<KeyboardEvents<KeyboardEvent>>
    & MouseEvents<MouseEvents<MouseEvent>>
    & FormEvents<FormEvents<Event>>
    & DragDropEvents<DragDropEvents<DragEvent>>
    & MediaEvents<MediaEvents<MediaStream>>
    & AnimationTransitionEvents<AnimationTransitionEvents<AnimationEvent>>


type EventsTypes = {
    mouseEvent: MouseEvent,
    keyboardEvent: KeyboardEvent,
    formEvent: Event,
    dragDropEvent: DragEvent,
    mediaEvent: MediaEvents<MediaStream>,
    animationTransitionEvent: AnimationEvent,
    windowEvent: Event
}

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





export type Tracker = {
    running: boolean,
    showConfig: Function,
    config: Config,
    start: Function,
    stop: Function,
    results: Events & Metadata,
}

