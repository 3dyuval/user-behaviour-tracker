/// <reference types="vitest" />
// @vitest-environment jsdom

import { beforeAll, describe, expect, test } from 'vitest'
import tracker from '../src'
import type { Config, Results, Tracker } from "../src/types";


describe('tracker function', () => {


    test('we are working in a browser', async () => {

        expect(typeof window).toBeDefined()
        expect(typeof document).toBeDefined()
        expect(typeof navigator).toBeDefined()

    })


    let controller: Tracker;
    controller = tracker();

    test('should return a controller', async () => {
        let controller: Tracker = tracker();

        expect(controller).toBeDefined()
        expect(typeof controller).toBe('object')
        expect(typeof controller.start).toBe('function')
        expect(typeof controller.stop).toBe('function')

    });

    test('start and stop operation', async () => {

        let controller = tracker();
        controller.start();
        await (setTimeout(() => Promise.resolve(), 1000));
        expect(controller.running).toBe(true)
        controller.stop()
        await (setTimeout(() => Promise.resolve(), 1000));
        expect(controller.running).toBe(false)
    });

})



