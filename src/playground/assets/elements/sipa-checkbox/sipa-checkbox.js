
class SipaCheckbox extends SipaElement {

    constructor() {
        super();
    }

    onClick(e) {
        if(e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
            this.setState({ checked: e.target.checked }, true);
        }
    }

    onInternalChange(e) {
        if(e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
            this.setState({ checked: e.target.checked }, true);
        }
    }

    template() {
        return `
            Checkbox
        `
    }
}

customElements.define('sipa-checkbox', SipaCheckbox);