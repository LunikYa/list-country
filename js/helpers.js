class Form {
    constructor(data) {
        this.data = data;
        this.Emitter = new Emiter();
    }
    render(inputsOptions) {
        let options = inputsOptions || this.data.inputsOptions,
            form    = document.createElement('form'),
            arrInp  = options.map(x => { return this.createInput(x) });
    
            form.name       = this.data.nameForm || 'default';
            form.noValidate = true;
            form.method     = 'post';

        for (let i = 0; i < arrInp.length; i++) {
            let div = new ErrorBox({ eventName: arrInp[i].type + i, Emitter: this.Emitter })
            arrInp[i].setAttribute('data-index', i)
            form.appendChild(arrInp[i]);
            form.appendChild(div.render(arrInp[i]));
        }
        let buttonReg = new ButtonSubmit({ class: 'button', text: 'Submit' });
            form.appendChild(buttonReg.render());
        return form
    }

    createInput(options) {
        let input = new Input(options);
        return (this.addValidate(input.render()));
    }

    addValidate(input) {
        input.addEventListener('focus', (event) => {
            event.target.style.border = '1px solid black';
            this.Emitter.emit(('HideErrorBox', { 'detail': input.nextElementSibling }))
        })
        if (input.type === 'email') {
            input.addEventListener('blur', this.isValidemail.bind(this));

        } else if (input.type === 'password') {
            input.addEventListener('blur', this.isValidpassword.bind(this));

        } else if (input.type === 'text') {
            input.addEventListener('blur', this.isValidtext.bind(this));
        }
        return input
    }

    isValidemail(event) {
        let input = event.target || event;
        let regExpEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        try {
            if (!regExpEmail.test(input.value)) {
                throw ({ message: '*Email is not valid', elem: input })
            }
            input.style.border = '1px solid green';
            this.Emitter.emit('HideErrorBox', { 'detail': input.nextElementSibling })
            return true
        } catch (error) {
            this.showError(error, input)
            return false
        }
    }

    isValidpassword(event) {
        let input = event.target || event;
        try {
            if (/\W/.test(input.value)) {
                throw ({ message: '*Password can`t include special character', elem: input })
            }
            else if (input.value.length < 6) {
                throw ({ message: '*Password must be 6 or more characters', elem: input })
            }
            input.style.border = '1px solid green';
            this.Emitter.emit('HideErrorBox', { 'detail': input.nextElementSibling })
            return true
        } catch (error) {
            this.showError(error, input)
            return false
        }
    }

    isValidtext(event) {
        let input = event.target || event;
        try {
            if (/\W|\d/.test(input.value[0])) {
                throw ({ message: '*First char must be letter', elem: input })
            }
            else if (input.value.length < 3) {
                throw ({ message: '*This field must be 3 or more characters', elem: input })
            }
            input.style.border = '1px solid green';
            this.Emitter.emit('HideErrorBox', { 'detail': input.nextElementSibling })
            return true
        } catch (error) {
            this.showError(error, input)
            return false
        }
    }

    showError(error, input) {
        this.Emitter.emit(input.type + input.getAttribute('data-index'), { 'detail': error })
        input.style.border = '1px solid red'
    }
}

class Input {
    constructor(data) {
        this.data = data;
    }   
    render(obj) {
        let input   = document.createElement('input'),
            options = obj || this.data;
            input.className = options.class;

        for (let key in options) {
            input[key] = options[key];
        }
        return input;
    }
}

class ErrorBox {
    constructor(data) {
        this.data = data;
    }
    render() {
        let box = document.createElement('div');
            box.textContent = 'error';
            box.className   = 'errormsg';

        this.data.Emitter.on(this.data.eventName, (data) => {
            box.style.display = 'block';
            box.textContent   = data.detail.message;
        })

        this.data.Emitter.on('HideErrorBox', (data) => {
            data.detail.style.display = 'none';
        })
        return box
    }
}

class LinkRoute {
    constructor(data) {
        this.data    = data;
        this.Emitter = new Emiter()
        this.render()        
    }
    render() {
        let p         = document.createElement('p');
        p.className   = this.data.class;
        p.textContent = this.data.text;
        p.onclick = () => {
            this.Emitter.emit('go-to-' + this.data.url)
        };
        return p
    }
    on(event, callback) {
        this.Emitter.on(event, callback)
    }
}

class ButtonSubmit {
    constructor(data) {
        this.data = data;
    }
    render() {
        let button             = document.createElement('button');
            button.className   = this.data.class;
            button.textContent = this.data.text;
            button.onclick     = this.data.event;
            button.type        = 'submit';
        return button
    }
}

class Caption {
    constructor(data) {
        this.data = data;
        this.render()
    }
    render() {
        let h2 = document.createElement('h2');
            h2.className   = this.data.class || '';
            h2.textContent = this.data.text || '';
        return h2
    }
}


function httpGet(url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function () {
            if (this.status == 200) {
                resolve(JSON.parse(this.response));
            } else {
                let error = new Error(this.statusText);
                error.code = this.status;
                reject(error);
            }
        };
        xhr.onerror = function () {
            reject(new Error('Network Error'));
        };
        xhr.send();
    });
}

class Emiter {
    constructor() {
        this.init();
    }
    init() {
        this.events = {}
    }
    on(event, listeners) {
        if (!this.events.hasOwnProperty(event)) {
            this.events[event] = []
        }
        this.events[event].push(listeners)
    }
    emit(event) {
        var i, listeners, length, args = [].slice.call(arguments, 1);

        if (this.events.hasOwnProperty(event)) {
            listeners = this.events[event].slice()
            length = listeners.length

            for (i = 0; i < length; i++) {
                listeners[i].apply(this, args)
            }
        }
    }
}
