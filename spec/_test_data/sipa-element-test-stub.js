window.eta = window.eta || {
    Eta: class {
        compile(template) {
            const matcher = /<%([=-]?)([\s\S]+?)%>/g;
            let cursor = 0;
            let generatedCode = "const __scope = new Proxy(it || {}, { has: () => true, get: (target, prop) => target[prop] });\nlet __output = ``;\nwith(__scope) {\n";
            let match = null;

            while((match = matcher.exec(template)) !== null) {
                const text = template
                    .slice(cursor, match.index)
                    .replace(/\\/g, '\\\\')
                    .replace(/`/g, '\\`')
                    .replace(/\$\{/g, '\\${');
                generatedCode += `__output += \`${text}\`;\n`;

                if(match[1] === '=') {
                    generatedCode += `__output += (${match[2].trim()});\n`;
                } else {
                    generatedCode += `${match[2]}\n`;
                }

                cursor = match.index + match[0].length;
            }

            const tail = template
                .slice(cursor)
                .replace(/\\/g, '\\\\')
                .replace(/`/g, '\\`')
                .replace(/\$\{/g, '\\${');
            generatedCode += `__output += \`${tail}\`;\n}\nreturn __output;`;

            return new Function('it', generatedCode);
        }
    }
};

window.morphdom = window.morphdom || function(target, html) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    target.innerHTML = wrapper.innerHTML;
    return target;
};

