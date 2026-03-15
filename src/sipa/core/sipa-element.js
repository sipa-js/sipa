/**
 *
 * SipaElement is the successor of SipaComponent.
 *
 * Differences:
 *  - based on ETA instead of EJS
 *  - using morphdom to avoid flickering and replacing unchanged elements, which can lead to "destroy" them,
 *    e.g. a running <video> will be restarted, etc.
 *  - using customElements.define
 *
 */

var Eta = new eta.Eta();

class SipaElement extends HTMLElement {
    constructor() {
        super();
        this.state = {};
        this._compiledTemplate = null;
    }

    // Diese Methode setzt du in deiner Komponente
    template() { return ''; }

    setState(newState, shouldBubble = false) {
        this.state = { ...this.state, ...newState };
        this._update();

        // Wenn gewünscht, feuern wir ein Event nach außen
        if (shouldBubble) {
            this._emitChange();
        }
    }

    /**
     * This method is called after the element has been attached to the DOM
     */
    connectedCallback() {
        if (!this._compiledTemplate) {
            this._compiledTemplate = Eta.compile(this.template()).bind(Eta);
        }

        // Interne Delegation: Wir hören auf Events von unseren Kindern
        this.addEventListener('change', (e) => this._onInternalChange(e));
        this.addEventListener('input', (e) => this._onInternalChange(e));

        this._update();
    }

    _onInternalChange(e) {
        const action = e.target.getAttribute('data-action');
        if (action && typeof this[action] === 'function') {
            this[action](e);
            // Nach einer internen Aktion melden wir dies standardmäßig nach außen
            this._emitChange();
        }
    }

    _emitChange() {
        // Wir erstellen ein echtes "change" Event
        const event = new CustomEvent('change', {
            detail: this.state, // Wir schicken den aktuellen State mit
            bubbles: true,      // Erlaubt das Aufsteigen im DOM
        });
        this.dispatchEvent(event);
    }

    _update() {
        if (!this._compiledTemplate) return;
        const newHtml = this._compiledTemplate(this.state);
        morphdom(this, `<div>${newHtml}</div>`, { childrenOnly: true });
    }
}