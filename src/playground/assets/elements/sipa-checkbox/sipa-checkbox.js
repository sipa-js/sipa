
class SipaCheckbox extends SipaElement {

    static get observedAttributes() {
        return ['checked', 'disabled'];
    }

    constructor() {
        super();
        this.state = { checked: false };
        this._onHostClick = this._onHostClick.bind(this);
        this._onHostKeyDown = this._onHostKeyDown.bind(this);
        this._defaultTabIndex = null;
    }

    connectedCallback() {
        super.connectedCallback();

        if(this._defaultTabIndex === null) {
            this._defaultTabIndex = this.getAttribute('tabindex') || '0';
        }

        this.removeEventListener('click', this._onHostClick);
        this.removeEventListener('keydown', this._onHostKeyDown);
        this.addEventListener('click', this._onHostClick);
        this.addEventListener('keydown', this._onHostKeyDown);
        this._syncFromAttributes();
    }

    disconnectedCallback() {
        this.removeEventListener('click', this._onHostClick);
        this.removeEventListener('keydown', this._onHostKeyDown);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(oldValue !== newValue && (name === 'checked' || name === 'disabled')) {
            this._syncFromAttributes();
        }
    }

    onInternalChange(e) {
        if(e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
            this.setChecked(e.target.checked, true);
        }
    }

    _onHostClick(e) {
        if(this.hasAttribute('disabled')) {
            return;
        }

        if(e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
            return;
        }

        this.toggleChecked();
    }

    _onHostKeyDown(e) {
        if(this.hasAttribute('disabled') || e.repeat) {
            return;
        }

        const isSpace = e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space';
        const isEnter = e.key === 'Enter' || e.code === 'Enter';

        if(isSpace || isEnter) {
            e.preventDefault();
            this.toggleChecked();
        }
    }

    _syncFromAttributes() {
        const checked = this.hasAttribute('checked');

        if(this.state.checked !== checked) {
            this.setState({ checked }, false);
        }

        this._syncAccessibility();
    }

    _syncAccessibility() {
        this.setAttribute('role', 'checkbox');
        this.setAttribute('aria-checked', this.hasAttribute('checked') ? 'true' : 'false');
        this.setAttribute('aria-disabled', this.hasAttribute('disabled') ? 'true' : 'false');

        if(this.hasAttribute('disabled')) {
            this.setAttribute('tabindex', '-1');
        } else {
            this.setAttribute('tabindex', this._defaultTabIndex || '0');
        }
    }

    setChecked(checked, shouldBubble = true) {
        const normalizedChecked = !!checked;
        const hasChanged = this.hasAttribute('checked') !== normalizedChecked;

        this.toggleAttribute('checked', normalizedChecked);
        this._syncFromAttributes();

        if(shouldBubble && hasChanged) {
            this._emitChange();
        }
    }

    toggleChecked() {
        this.setChecked(!this.hasAttribute('checked'), true);
    }

    template() {
        return `
            <span class="checkbox__control" aria-hidden="true">
                <span class="checkbox__checkmark"></span>
            </span>
        `
    }
}

customElements.define('sipa-checkbox', SipaCheckbox);