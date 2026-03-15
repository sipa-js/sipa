//----------------------------------------------------------------------------------------------------

describe('SipaCheckbox', () => {
    let checkbox;

    function createCheckbox(attributes = []) {
        checkbox = document.createElement('sipa-checkbox');
        attributes.forEach((attributeName) => checkbox.setAttribute(attributeName, ''));
        checkbox.connectedCallback();
        return checkbox;
    }

    afterEach(() => {
        if(checkbox && typeof checkbox.disconnectedCallback === 'function') {
            checkbox.disconnectedCallback();
        }

        checkbox = null;
    });

    it('synchronisiert Standard-ARIA-Attribute und den initialen State', () => {
        const checkbox = createCheckbox();

        expect(checkbox.getAttribute('role')).toEqual('checkbox');
        expect(checkbox.getAttribute('aria-checked')).toEqual('false');
        expect(checkbox.getAttribute('aria-disabled')).toEqual('false');
        expect(checkbox.getAttribute('tabindex')).toEqual('0');
        expect(checkbox.state.checked).toEqual(false);
    });

    it('setzt und entfernt checked beim Klick und feuert genau ein change-Event je Toggle', () => {
        const checkbox = createCheckbox();
        const details = [];

        checkbox.addEventListener('change', (event) => {
            details.push(event.detail.checked);
        });

        checkbox._onHostClick({ target: { tagName: 'SIPA-CHECKBOX' } });
        expect(checkbox.hasAttribute('checked')).toEqual(true);
        expect(checkbox.getAttribute('aria-checked')).toEqual('true');
        expect(checkbox.state.checked).toEqual(true);

        checkbox._onHostClick({ target: { tagName: 'SIPA-CHECKBOX' } });
        expect(checkbox.hasAttribute('checked')).toEqual(false);
        expect(checkbox.getAttribute('aria-checked')).toEqual('false');
        expect(checkbox.state.checked).toEqual(false);

        expect(details).toEqual([true, false]);
    });

    it('toggle per Tastatur mit Leertaste und Enter', () => {
        const checkbox = createCheckbox();

        checkbox._onHostKeyDown({
            key: ' ',
            code: 'Space',
            repeat: false,
            preventDefault() {}
        });
        expect(checkbox.hasAttribute('checked')).toEqual(true);

        checkbox._onHostKeyDown({
            key: 'Enter',
            code: 'Enter',
            repeat: false,
            preventDefault() {}
        });
        expect(checkbox.hasAttribute('checked')).toEqual(false);
    });

    it('synchronisiert externe checked-Attributänderungen', () => {
        const checkbox = createCheckbox();

        checkbox.setAttribute('checked', '');
        expect(checkbox.state.checked).toEqual(true);
        expect(checkbox.getAttribute('aria-checked')).toEqual('true');

        checkbox.removeAttribute('checked');
        expect(checkbox.state.checked).toEqual(false);
        expect(checkbox.getAttribute('aria-checked')).toEqual('false');
    });

    it('bleibt bei disabled per Klick und Tastatur unverändert', () => {
        const checkbox = createCheckbox(['disabled']);

        expect(checkbox.getAttribute('aria-disabled')).toEqual('true');
        expect(checkbox.getAttribute('tabindex')).toEqual('-1');

        checkbox._onHostClick({ target: { tagName: 'SIPA-CHECKBOX' } });
        checkbox._onHostKeyDown({
            key: 'Enter',
            code: 'Enter',
            repeat: false,
            preventDefault() {}
        });

        expect(checkbox.hasAttribute('checked')).toEqual(false);
        expect(checkbox.state.checked).toEqual(false);
    });
});

//----------------------------------------------------------------------------------------------------

