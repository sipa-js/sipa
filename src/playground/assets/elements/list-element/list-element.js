
class ListElement extends SipaElement {
    template() {
        return `
            <div class="item">Example</div>
            <div class="item">Example2</div>
            <div class="item">Example3</div>
            <div class="item">Example4</div>
        `
    }
}

customElements.define('list-element', ListElement);