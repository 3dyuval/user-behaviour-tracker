import Tracker from '~/'

const tracker = new Tracker({
    mouseMovementInterval: 1000
});
    tracker.start();
    setInterval(() => {
        console.dir(tracker.results);
    }, 1000);