//----------------------------------------------------------------------------------------------------

SipaComponentNestedEventsSpec = {};
SipaComponentNestedEventsSpec.options = {};

//----------------------------------------------------------------------------------------------------

class ParentEventComponent extends SipaComponent {
}

SipaComponent.registerComponent(ParentEventComponent);

class ChildEventComponent extends SipaComponent {
}

SipaComponent.registerComponent(ChildEventComponent);

//----------------------------------------------------------------------------------------------------

describe('SipaComponent Nested Events', () => {
    beforeAll(() => {
        SipaTest.enableTestingMode();

        ParentEventComponent = class extends SipaComponent {
            constructor(data = {}, opts = {}) {
                super(data, opts);
            }

            static template = () => {
                return `<parent-event-component>
                    <child-event-component sipa-alias="child1" name="'Child 1'"></child-event-component>
                    <child-event-component sipa-alias="child2" name="'Child 2'"></child-event-component>
                </parent-event-component>`;
            }
        }

        ChildEventComponent = class extends SipaComponent {
            constructor(data = {}, opts = {}) {
                data.name ??= "default";
                data.custom_event_count ??= 0;
                super(data, opts);
            }

            static template = () => {
                return `<child-event-component><%= name %></child-event-component>`;
            }

            incrementCustomEvent() {
                this.events().trigger('custom_increment', [this._data.custom_event_count]);
                this._data.custom_event_count++;
            }

            events() {
                return this._events ??= new SipaEvents(['custom_increment', 'before_update', 'after_update', 'before_destroy', 'after_destroy']);
            }
        }
    });

    beforeEach(() => {
        $("playground").remove();
        $("body").append($("<playground></playground>")[0]);
    });

    describe('event reference stability', () => {
        it('should maintain event subscriptions after syncNestedReferences', function () {
            const parent = new ParentEventComponent();
            parent.initTemplate();

            let eventCalled = false;
            const child1 = parent.children().child1;
            
            // Subscribe to child event
            child1.events().subscribe('custom_increment', () => {
                eventCalled = true;
            });

            // Trigger event before sync - should work
            child1.incrementCustomEvent();
            expect(eventCalled).toBe(true);

            // Reset flag
            eventCalled = false;

            // Sync nested references (this might break event subscriptions)
            parent.syncNestedReferences();

            // Try to trigger event after sync - this might fail
            child1.incrementCustomEvent();
            expect(eventCalled).toBe(true);
        });

        it('should maintain event subscriptions after component update', function () {
            const parent = new ParentEventComponent();
            parent.append("playground");

            let eventCalled = false;
            const child1 = parent.children().child1;
            
            // Subscribe to child event
            child1.events().subscribe('custom_increment', () => {
                eventCalled = true;
            });

            // Trigger event before update - should work
            child1.incrementCustomEvent();
            expect(eventCalled).toBe(true);

            // Reset flag
            eventCalled = false;

            // Update parent (this might recreate children and break event subscriptions)
            parent.update({ some_data: 'test' });

            // Try to trigger event after update - this might fail
            const child1AfterUpdate = parent.children().child1;
            child1AfterUpdate.incrementCustomEvent();
            expect(eventCalled).toBe(true);
        });

        it('should maintain child reference stability through updates', function () {
            const parent = new ParentEventComponent();
            parent.append("playground");

            const child1Before = parent.children().child1;
            const eventsInstanceBefore = child1Before._events;

            // Update parent
            parent.update({ some_data: 'test' });

            const child1After = parent.children().child1;
            const eventsInstanceAfter = child1After._events;

            // Check if the child instance is the same (it should be)
            expect(child1Before).toBe(child1After);
            // Check if the events instance is the same (it should be)
            expect(eventsInstanceBefore).toBe(eventsInstanceAfter);
        });

        it('should maintain nested child event subscriptions through deep updates', function () {
            // Create a deeper nesting scenario
            ParentEventComponent = class extends SipaComponent {
                static template = () => {
                    return `<parent-event-component>
                        <child-event-component sipa-alias="level1" name="'Level 1'">
                            <child-event-component sipa-alias="level2" name="'Level 2'"></child-event-component>
                        </child-event-component>
                    </parent-event-component>`;
                }
            }

            const parent = new ParentEventComponent();
            parent.append("playground");

            let level1EventCalled = false;
            let level2EventCalled = false;

            const level1Child = parent.children().level1;
            
            // First check if level1 child has level2 child
            expect(level1Child).toBeDefined();
            expect(Object.keys(level1Child.children())).toContain('level2');
            
            const level2Child = level1Child.children().level2;
            expect(level2Child).toBeDefined();

            // Subscribe to events at both levels
            level1Child.events().subscribe('custom_increment', () => {
                level1EventCalled = true;
            });

            level2Child.events().subscribe('custom_increment', () => {
                level2EventCalled = true;
            });

            // Trigger events before update
            level1Child.incrementCustomEvent();
            level2Child.incrementCustomEvent();
            expect(level1EventCalled).toBe(true);
            expect(level2EventCalled).toBe(true);

            // Reset flags
            level1EventCalled = false;
            level2EventCalled = false;

            // Update parent - this should preserve nested children and their events
            parent.update({ some_data: 'test' });

            // Try to trigger events after update
            const level1ChildAfter = parent.children().level1;
            expect(level1ChildAfter).toBeDefined();
            expect(Object.keys(level1ChildAfter.children())).toContain('level2');
            
            const level2ChildAfter = level1ChildAfter.children().level2;
            expect(level2ChildAfter).toBeDefined();

            level1ChildAfter.incrementCustomEvent();
            level2ChildAfter.incrementCustomEvent();

            expect(level1EventCalled).toBe(true);
            expect(level2EventCalled).toBe(true);
        });
    });
});

//----------------------------------------------------------------------------------------------------