import Tracker from '../../src/index'

const tracker = new Tracker({
    mouseMovementInterval: 500,
    callbackInterval: 5000,
});


window.addEventListener('blur', (e) => {
    console.dir(tracker.results, { colors: true, depth: 10});
    //send to server
    // wait for response
    // show responnse
})


tracker.start();

