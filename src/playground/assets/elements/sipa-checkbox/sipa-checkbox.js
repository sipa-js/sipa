
class SipaCheckbox extends SipaElement {

    static get observedAttributes() {
        return ['checked'];
    }

    constructor() {
        super();
        this._onHostClick = this._onHostClick.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();

        this.removeEventListener('click', this._onHostClick);
        this.addEventListener('click', this._onHostClick);
        this.setChecked(this.hasAttribute('checked'), false);
    }

    disconnectedCallback() {
        this.removeEventListener('click', this._onHostClick);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'checked' && oldValue !== newValue) {
            this.setState({ checked: newValue !== null }, false);
        }
    }

    onInternalChange(e) {
        if(e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
            this.setChecked(e.target.checked, true);
        }
    }

    _onHostClick(e) {
        if(e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
            return;
        }

        this.toggleChecked();
    }

    setChecked(checked, shouldBubble = true) {
        this.toggleAttribute('checked', checked);

        if(this.state.checked !== checked) {
            this.setState({ checked }, false);
        }

        if(shouldBubble) {
            this._emitChange();
        }
    }

    toggleChecked() {
        this.setChecked(!this.hasAttribute('checked'), true);
    }

    template() {
        return `
            Checkbox
        `
    }
}

customElements.define('sipa-checkbox', SipaCheckbox);