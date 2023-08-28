import getQuery from './getQuery';

export default class universalDebugger {
	constructor(options = {}) {
		if (window.universalDebugger) {
			return console.trace('Universal debugger already inited');
		}
			
		window.universalDebugger = this;
		
		this.options = {
			fontSize: 11,
			maxElts: 100,
			maxHeight: '40vh',
			showLineNum: true,
			...options
		};

		this.DOM = {
			debug: null
		};
		
		if (this.options.forceEnable == undefined && getQuery() && getQuery().debug != 1) {
			this.disabled = true;
			return;
		}

		this.count = 0;
		this.appendStyles();
		this.createDebug();
	}

	appendStyles = () => {
		const
			stylesElt = document.createElement('style'),
			styles = `
				.debug {
				    position: fixed;
				    bottom: 0;
				    left: 0;
				    z-index: 100000000;
				    max-height: ${this.options.maxHeight};
				    max-width: 80vh;
				    display: flex;
				    flex-direction: column;
				    color: #fff;
				    background-color: rgb(39, 41, 45);
				    font-family: Consolas, Courier New, monospace;
				    transition: max-height .3s;
				    font-size: ${this.options.fontSize}px;
				}

				.debug__container {
				    overflow-y: auto;
				}

			    .debug__container::-webkit-scrollbar {
			        width: 5px;
			    }
			    .debug__container::-webkit-scrollbar-track {
			        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
			    }

			    .debug__container::-webkit-scrollbar-thumb {
				    background-color: darkgrey;
				    outline: 1px solid slategrey;
			    }

				.debug__row {
					display: flex;
					padding: 5px 20px 5px 0;
					border-bottom: 1px solid rgba(127, 127, 127, 0.2);
				}
				
				.debug__row small {
					display: inline-block;
					font-size: 10px;
					color: #5a5a5a;
					text-align: right;
					width: 25px;
				}
				
				.debug__row span {
					display: inline-block;
					padding-left: 10px;
				}

				.debug__row--info {
					color: #4791ff;
				}
				
				.debug__row--err {
					background-color: #a70031;
				}

				.debug__close {
					position: absolute;
					top: -32px;
					right: 0;
					width: 32px;
					height: 32px;
					padding: 0;
					border: 0;
					background-color: #46265d;
				}

				.debug__close::before,
				.debug__close::after {
					position: absolute;
					top: 15px;
					width: 14px;
					height: 1px;
					background-color: #fff;
					transition: background-color .3s, transform .3s;
					content: '';
				}

				.debug__close::before {
					left: 4px;
					transform: rotate(45deg);
				}

				.debug__close::after {
					left: 14px;
					transform: rotate(-45deg);
				}
				
				.debug.is-closed {
					max-height: 32px;
				}
				
				.debug.is-closed .debug__close::before {
					transform: rotate(-45deg);
				}

				.debug.is-closed .debug__close::after {
					transform: rotate(45deg);
				}
			`;

		stylesElt.innerHTML = styles;
		document.body.appendChild(stylesElt);
	}

	createDebug = () => {
		this.DOM.debug = document.createElement('div');
		this.DOM.debug.classList.add('debug');
		this.DOM.debug.appendChild(this.createCloseButton());

		this.DOM.container = document.createElement('div');
		this.DOM.container.classList.add('debug__container');
		this.DOM.debug.appendChild(this.DOM.container);

		document.body.appendChild(this.DOM.debug);
	}

	objToString = (obj) => {
	    let 
	    	str = '{ ',
	    	propsCount = 0;

	    for (let p in obj) {
	        if (obj[p]) {
	        	if (propsCount > 0) {
	        		str += ', ';
	        	}
	        	
	            str += p + ':' + obj[p];
	            propsCount++;
	        }
	    }

	    return str + ' }';
	}

	createRow = (log) => {
		const
			row = document.createElement('div');
		
		row.classList.add('debug__row');
		const num = this.options.showLineNum ? `<small>${++this.count}</small>` : '';
		row.innerHTML =  num + `<span>${log}</span>`;

		return row;
	}

	prepareData = (data) => {
		let log = [];

		data.forEach((item, i, arr) => {
			if (typeof item == 'object') {
				log.push(this.objToString(item));
			} else {
				log.push(item);
			}
		});

		return log.join(' ');
	}

	createLog = (data) => {
		const log = this.prepareData(data);
		const row = this.createRow(log);
		this.DOM.container.appendChild(row);

		this.DOM.container.scrollTo(0, 10000000);
		
		if (this.count > this.options.maxElts) {
			this.DOM.container.removeChild(this.DOM.container.firstChild);
		}
		
		return row;
	}

	createPreLog = (data) => {
		const log = this.prepareData(data);
		const row = this.createRow(log);
		const pre = document.createElement('pre');
		pre.appendChild(row);
		this.DOM.container.appendChild(pre);

		this.DOM.container.scrollTo(0, 10000000);
		
		if (this.count > this.options.maxElts) {
			this.DOM.container.removeChild(this.DOM.container.firstChild);
		}
		
		return row;
	}

	createCloseButton = () => {
		const btn = document.createElement('button');

		btn.classList.add('debug__close');

		btn.addEventListener('click', (event) => {
		    this.closeEvent();
		});

		return btn;
	}

	closeEvent = () => {
		this.DOM.debug.classList.toggle('is-closed');
	}

	log = (...args) => {
		if (this.disabled) {
			return; // console.info(...arguments);
		}
		
		const row = this.createLog([args]);
		row.classList.add('debug__row--log');
	}

	pre = (...args) => {
		if (this.disabled) {
			return;
		}
		
		const row = this.createPreLog([...args]);
		row.classList.add('debug__row--log');
	}
	
	info = (...args) => {
		if (this.disabled) {
			return;
		}
		
		const row = this.createLog([...args]);
		row.classList.add('debug__row--info');
	}

	err = (...args) => {
		if (this.disabled) {
			return;
		}
		
		const row = this.createLog([...args]);
		row.classList.add('debug__row--err');
	}
}