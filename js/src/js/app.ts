import createDOM from './app/utils/createDOM';
import getQuery from './app/utils/getQuery';

import Form from './modules/Form';
import Popup from './modules/Popup';
import Index from './modules/index';

export default class App {
	DOM: any;
	form: Form;
	popup: Popup;
	formConstraints: any = {
		'form-demo': {
			'email': {
				presence: true,
				email: true
			}
		},
		'form-footer': {
			'email': {
				presence: true,
				email: true
			}
		}
	};
	hash: string;


	constructor() {
		this.DOM = createDOM();

        this.form = new Form();
        this.popup = new Popup();

        this.hash = window.location.hash.slice(1);

        switch(this.hash) {
			case 'privacy-policy':
				this.DOM.body.dataset.state = 'static';
				this.popup.openPopup(document.querySelector('[data-elements ~="popup"][data-popup="privacy-policy"]'), this.DOM.popup);
			break;

			case 'terms-of-service':
				this.DOM.body.dataset.state = 'static';
				this.popup.openPopup(document.querySelector('[data-elements ~="popup"][data-popup="terms-of-service"]'), this.DOM.popup);
			break;

			default:
				new Index(getQuery('debug') == '1');
		}

		if (!this.getCookie('cookieAccepted')) {
            this.DOM.cookie.classList.toggle('is-active', true);
        }

		this.addEvents();
	}

	addEvents = () => {
		document.addEventListener('click', this.handleDocumentClick);
		document.addEventListener('change', this.handleDocumentChange);
		document.addEventListener('submit', this.handleDocumentSubmit);
	}

	handleDocumentClick = (e: any) => {
		/*popup*/
		if (e.target.closest('[data-elements ~="popupBtn"]')) {
			e.preventDefault();

			let el = e.target.closest('[data-elements ~="popupBtn"]'),
				id = el.getAttribute('data-popup'),
				targetPopup: HTMLElement | null = document.querySelector('[data-elements ~="popup"][data-popup="'+ id +'"]'),
				popups: NodeListOf<Element> = document.querySelectorAll('[data-elements ~="popup"]');

			if (!el.classList.contains('is-open')) {
				this.popup.openPopup(targetPopup, popups);
				targetPopup?.querySelector('.popup__box')?.scrollTo(0, 0);
			} else {
				this.popup.closePopup(popups);
			}
		}

		if (e.target.closest('[data-elements ~="popupClose"]')) {
			e.preventDefault();
			this.popup.closePopup(this.DOM.popup);
		}

		if (!e.target.closest('.popup__box, [data-elements ~="popupBtn"], [data-element ~="acceptCookie"], .header')) {
			this.popup.closePopup(this.DOM.popup);
		}

		/*cookie*/

        if (e.target.closest('[data-element ~="acceptCookie"]')) {
			let date = new Date();
			this.setCookie('cookieAccepted', '1', { expires: new Date(date.setDate(date.getDate() + 30)) });
		    this.DOM.cookie.classList.toggle('is-active', false);

		    e.preventDefault();
		    return false;
		}
	}

	handleDocumentChange = (e: any) => {
		/*validate*/
		if (e.target?.closest('[data-elements ~= "formInput"], [data-elements ~= "formSelect"]')) {
			let el = e.target.closest('[data-elements ~= "formInput"], [data-elements ~= "formSelect"]'),
				form = el.closest('[data-elements ~= "form"]'),
				constraints = this.formConstraints[form.id];

			this.form.validateInput(el, form, constraints);
		}
	}

	handleDocumentSubmit = (e: any) => {
		e.preventDefault();

		if (e.target.closest('[data-elements ~= "form"]')) {
			let form = e.target.closest('[data-elements ~= "form"]'),
				constraints = this.formConstraints[form.id],
				url = 'https://db.pixelynx.io/api/data';//form.dataset.url;

			this.form.handleFormSubmit(form, constraints, url);
		}
	}

	setCookie(name: string, value: string, options: any = {}) {
        options = {
            path: '/',
            ...options
        };

        if (options.expires instanceof Date) {
            options.expires = options.expires.toUTCString();
        }

        let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

        for (let optionKey in options) {
            updatedCookie += "; " + optionKey;
            let optionValue = options[optionKey];

            if (optionValue !== true) {
                updatedCookie += "=" + optionValue;
            }
        }

        document.cookie = updatedCookie;
    }

    getCookie(name: string) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));

        return matches ? decodeURIComponent(matches[1]) : undefined;
    }
}

window.addEventListener('DOMContentLoaded', () => {
	new App();
});
