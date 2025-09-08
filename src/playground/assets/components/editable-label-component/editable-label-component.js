class EditableLabelComponent extends SipaComponent {

    constructor(data = {}, options = {}) {
        data.text ??= "Editable Label";
        // Here we store the temporary text while editing
        data.temp_text = "";
        data.is_editable ??= true;
        data.is_in_edit_mode ??= false;
        super(data, options);
    }

    value(text) {
        if (typeof text !== 'undefined') {
            this.updateLabelText(text);
        }
        return this._data.text;
    }

    enterEditMode() {
        this.update({
            is_in_edit_mode: true,
        });
        this.resizeInput();
        this.inputFieldElement().focus();
        // go to last position
        this.inputFieldElement().setSelectionRange(this.inputFieldElement().value.length, this.inputFieldElement().value.length);
    }

    exitEditMode(save_changes = true) {
        if (!save_changes) {
            this._data.temp_text = "";
        } else {
            this.updateLabelText(this._data.temp_text);
        }
        this.update({
            temp_text: null,
            is_in_edit_mode: false,
        });
    }

    updateLabelText(newText) {
        this.update({
            text: newText.slice(),
        });
    }

    onKeyUp(event) {
        this._data.temp_text = event.target.value;
        this.resizeInput();
        if (event.key === "Enter") {
            this.exitEditMode(true);
        } else if (event.key === "Escape") {
            this.exitEditMode(false);
        }
    }

    resizeInput() {
        const input = this.inputFieldElement();
        input.style.width = ((input.value.length + 1) * 8) + 'px'; // Adjust multiplier as needed
    }

    inputFieldElement() {
        return this.element().querySelector('input[type="text"]');
    }
}

EditableLabelComponent.template = () => {
    return `
<editable-label-component>
    <% if(is_in_edit_mode && is_editable) { %>
        <input type="text" value="<%= text %>" onkeyup="instance(this).onKeyUp(event)"" />
        <button onclick="instance(this).exitEditMode(true);">Save</button>
        <button onclick="instance(this).exitEditMode(false);">Cancel</button>
    <% } else { %>
        <span onclick="if(instance(this)._data.is_editable) { instance(this).enterEditMode(); }"><%= text %></span>
    <% } %>
</editable-label-component>
    `;
}

SipaComponent.registerComponent(EditableLabelComponent);