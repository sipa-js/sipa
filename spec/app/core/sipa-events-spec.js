//----------------------------------------------------------------------------------------------------

SipaEventsSpecSpec = {};
SipaEventsSpecSpec.options = {};

//----------------------------------------------------------------------------------------------------

describe('SipaEvents', () => {
    beforeEach(() => {
    });
    describe('.create', () => {
        beforeEach(() => {
        });
        it('creates an event without event name', function () {
            expect(() => { new SipaEvents(); }).toThrowError();
        });
        it('creates an event with one event name', function () {
            expect((new SipaEvents("gorki"))._valid_event_names).toEqual(["gorki"]);
        });
        it('creates an event with three different event names', function () {
            expect((new SipaEvents("gorki", "borki", "sorki"))._valid_event_names).toEqual(["gorki","borki","sorki"]);
        });
        it('creates an event with two identical event names', function () {
            expect(() => { new SipaEvents("gorki", "gorki"); }).toThrowError();
        });
        it('creates an event without event name by Array', function () {
            expect(() => { new SipaEvents(); }).toThrowError();
        });
        it('creates an event with one event name by Array', function () {
            expect((new SipaEvents(["gorki5"]))._valid_event_names).toEqual(["gorki5"]);
        });
        it('creates an event with three different event names by Array', function () {
            expect((new SipaEvents("gorki", "borki", "sorki"))._valid_event_names).toEqual(["gorki","borki","sorki"]);
        });
        it('creates an event with three different event names by nested Arrays', function () {
            expect((new SipaEvents(["gorki", ["borki"], ["sorki"]]))._valid_event_names).toEqual(["gorki", "borki", "sorki"]);
        });
        it('creates an event with two identical event names by Array', function () {
            expect(() => { new SipaEvents(["gorki", "gorki"])}).toThrowError();
        });
        it('creates an event with two identical event names by nested Array', function () {
            expect(() => { new SipaEvents(["gorki", ["gorki"]]) }).toThrowError();
        });
    });
    describe('.subscribe', () => {
        beforeEach(() => {
        });
        it('subscribes and triggers an event with several parameters once', function (done) {
            const event = new SipaEvents('clicky', 'testy');
            event.subscribe('clicky', (param1, param2) => {
                expect(param1).toEqual([5, 4, 3]);
                expect(param2).toEqual("Gorki");
                done();
            });
            event.trigger('clicky', [5, 4, 3], "Gorki");
        });
        it('subscribes and triggers an event several times with different functions', function () {
            const event = new SipaEvents('several');
            let sum = 0;
            event.subscribe('several', () => { sum += 1;});
            event.subscribe('several', () => { sum += 2;});
            event.subscribe('several', () => { sum += 4});
            event.trigger('several');
            expect(sum).toEqual(7);
            expect(event._event_registry['several'].length).toEqual(3);
        });
        it('subscribes and triggers an event several times with the same function', function () {
            const event = new SipaEvents('several_same');
            let counter = 0;
            const counterFunction = (param) => {
                ++counter;
            }
            event.subscribe('several_same', counterFunction);
            event.subscribe('several_same', counterFunction);
            event.subscribe('several_same', counterFunction);
            event.trigger('several_same');
            expect(event._event_registry['several_same'].length).toEqual(1);
            expect(counter).toEqual(1);
        });
        it('subscribes an event that is not valid', function () {
            const event = new SipaEvents('valid1');
            expect(() => { event.subscribe("invalid1") }).toThrowError(Error);
        });
        it('subscribes an event that is not triggered', function () {
            const event = new SipaEvents('subscribe77');
            let result = "original";
            event.subscribe("subscribe77", () => {
                result = "modified";
            });
            expect(result).toEqual("original");
        });
    });
    describe('.trigger', () => {
        it('triggers an event that is not valid', function () {
            const event = new SipaEvents('valid2');
            expect(() => { event.trigger("invalid2") }).toThrowError(Error);
        });
        it('triggers an event that is subscribed', function () {
            const event = new SipaEvents('trigger2');
            let result = null;
            event.subscribe("trigger2", () => { result = "triggered" });
            event.trigger("trigger2");
            expect(result).toEqual("triggered");
        });
        it('triggers an event that is not subscribed', function () {
            const event = new SipaEvents('trigger3');
            expect(() => { event.trigger("trigger3"); }).not.toThrowError();
        });
    });
    describe('.reset', () => {
        it('resets an event without any events', function () {
            const event = new SipaEvents('reset1');
            event.reset();
            expect(Object.keys(event._event_registry).length).toEqual(0);
        });
        it('resets an event with one events', function () {
            const event = new SipaEvents('reset1');
            event.reset();
            expect(Object.keys(event._event_registry).length).toEqual(0);
        });
        it('resets an event with three events', function () {
            const event = new SipaEvents('reset1');
            event.reset();
            expect(Object.keys(event._event_registry).length).toEqual(0);
        });
    });
    describe('.constructor', () => {
        it('creates a new event with one valid event', function () {
            expect(() => { new SipaEvents('valid_one'); }).not.toThrowError(Error);
        });
        it('creates a new event with three valid events', function () {
            expect(() => { new SipaEvents('valid_one', 'valid_two', 'valid_three'); }).not.toThrowError(Error);
        });
        it('creates a new event without a valid event', function () {
            expect(() => { new SipaEvents(); }).toThrowError(Error);
        });
    });
});

//----------------------------------------------------------------------------------------------------