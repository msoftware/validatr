/*
 * Validatr
 * https://github.com/morrowj/validatr
 *
 * Copyright (c) 2013 Jay Morrow
 * Licensed under the MIT license.
 */

(function(window, document, $, undefined) {
    "use strict";

    /*! Modernizr 2.6.2 (Custom Build) | MIT & BSD
     * Build: http://modernizr.com/download/#-input-inputtypes
     */
    var Support = (function() {

        var Modernizr = {},

        docElement = document.documentElement,

        smile = ':)',

        inputElem  = document.createElement('input'),

        tests = {},

        inputs = {},

        attrs = {};

        Modernizr['input'] = (function( props ) {
            for ( var i = 0, len = props.length; i < len; i++ ) {
                attrs[ props[i] ] = !!(props[i] in inputElem);
            }
            if (attrs.list){
                attrs.list = !!(document.createElement('datalist') && window.HTMLDataListElement);
            }
            return attrs;
        })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' '));

        Modernizr['inputtypes'] = (function(props) {

            for ( var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++ ) {

                inputElem.setAttribute('type', inputElemType = props[i]);
                bool = inputElem.type !== 'text';

                if ( bool ) {

                    inputElem.value         = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                    if ( /^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined ) {

                        docElement.appendChild(inputElem);
                        defaultView = document.defaultView;

                        bool =  defaultView.getComputedStyle &&
                        defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                        (inputElem.offsetHeight !== 0);

                        docElement.removeChild(inputElem);

                    } else if ( /^(search|tel)$/.test(inputElemType) ){
                    } else if ( /^(url|email)$/.test(inputElemType) ) {
                        bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                    } else {
                        bool = inputElem.value !== smile;
                    }
                }

                inputs[ props[i] ] = !!bool;
            }

            return inputs;
        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));

        inputElem = null;

        return Modernizr;
    })(),
    
    Rules = {
        boxes: /checkbox|radio/i,
        color: /^#[0-9A-F]{6}$/i,
        date: /^(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/,
        email: /^[a-zA-Z0-9.!#$%&’*+\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/,
        leftright: /left|right/i,
        time: /^([01][0-9]|2[0-3])(:([0-5][0-9])){2}$/,
        topbottom: /top|bottom/i,
        url: /https?:\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    },
    
    Tests = {
        checkbox: function (element) {
            return {
                valid: element.checked,
                message: 'Please check this box if you want to proceed.'
            };
        },

        color: function (element) {
            return {
                valid: Rules.color.test(element.value),
                message: 'Please enter a color in the format #xxxxxx'
            };
        },

        date: function (element) {
            return {
                valid: Rules.date.test(element.value),
                message: 'Please enter a date in the format mm/dd/yyyy'
            };
        },

        email: function (element) {           
            return {
                valid: Rules.email.test(element.value),
                message: 'Please enter an email address.'
            };
        },

        number: function (element) {
            var $element = $(element),
                value = isNaN(parseFloat(element.value)) ? false : parseFloat(element.value),
                min = value !== false ? isNaN($element.attr('min')) ? false : parseFloat($element.attr('min')) : value,
                max = value !== false ? isNaN($element.attr('max')) ? false : parseFloat($element.attr('max')) : value,
                result = true,
                msg = 'Please enter a number';


            if (min !== false && max !== false) {
                result = value >= min && value <= max;
                msg = 'Please enter a number greater than or equal to ' + min + ' and less than or equal to ' + max + '.';
            } else if (min !== false) {
                result = value >= min;
                msg = 'Please enter a number greater than or equal to ' + min + '.';
            } else if (max !== false) {
                result = value <= max;
                msg = 'Please enter a number less than or equal to ' + max + '.';
            }

            return {
                valid: value !== false && result,
                message: msg
            };
        },

        pattern: function (element) {
            return {
                valid: new RegExp(element.pattern).test(element.value),
                message: 'Please match the requested format.'
            };
        },

        radio: function (element) {
            return {
                valid: $(document.getElementsByName(element.name)).is(':checked'),
                message: 'Please select one of these options.'
            };
        },

        range: function (element) {
            return this.number(element);
        },

        required: function (element) {
            if (Rules.boxes.test(element.type)) {
                return this[element.type](element);
            }

            return {
                valid: element.value.length,
                message: element.nodeName.toLowerCase() === 'select' ? 'Please select an item in the list.' : 'Please fill out this field.'
            };
        },

        text: function () {
            return {
                valid: true
            };
        },

        time: function (element) {
            return {
                valid: Rules.time.test(element.value),
                message: 'Please enter a time in the format hh:mm:ss'
            };
        },

        url: function (element) {
            return {
                valid: Rules.url.test(element.value),
                message: 'Please enter a url.'
            };
        }
    },

    CustomTests = {
        match: function (element) {
            var match = $(element).data('match'),
                source = document.getElementById(match) || document.getElementsByName(match)[0];

            if (!source) {
                return {
                    valid: false,
                    message: "'" + match + "' can not be found"
                };
            }

            $(source)
                .off('valid.validatrinput')
                .on('valid.validatrinput', function () {
                    if (element.value === source.value) {
                        validateElement(element);
                    }
                });

            return {
                valid: element.value === source.value,
                message: "'" + element.name + "' does not equal '" + source.name +"'"
            };
        }
    },

    getNode = function (element) {
        if (element instanceof jQuery) {
            element = element[0];
        }
        return element;
    },

    widgetName = 'validatr',

    theme = {
        base: widgetName + '-message ',
        bootstrap: 'alert alert-error',
        jqueryui: 'ui-state-error ui-corner-all',
        none: widgetName + '-error'
    },

    submit = 'button, input[type=submit], input[type=button], input[type=reset]',

    supressError = false,

    // Validatr
    Widget = function () {};

    Widget.prototype = {

        addTest: function (name) {
            var isObject = typeof name !== 'string',
                args = Array.prototype.slice.call(arguments, 1)[0];

            if (isObject) {
                $.extend(CustomTests, name);
            } else {
                CustomTests[name] = args;
            }
        },

        getElements: function (form) {
            if (this.elements) {
                return this.elements;
            }

            return $(form)
                .map(function () {
                    return this.elements ? $.makeArray(this.elements) : $.makeArray($(this).find('input, textarea, select'));
                })
                .not(submit);
        },

        validateElement: function (element) {
            if (!element) {
                throw new Error('method requires an element');
            }

            supressError = true;
            var valid = validateElement(getNode(element));
            supressError = false;

            return valid;
        },

        validateForm: function (form) {
            var element = this.el || getNode(form),
                valid;

            if (element.nodeName.toLowerCase() !== 'form') {
                throw new Error('you must pass a form to this method');
            }

            supressError = true;
            valid = validateForm(this.elements || this.getElements(element));
            supressError = false;

            return valid;
        }
    };

    function init (el, options) {
        /*jshint validthis:true */

        this.el = el;
        this.$el = $(el);

        if (!this.$el.length || !this.$el.is('form')) {
            throw new Error(widgetName + ' needs a form to work.');
        }

        this.isSubmit = false;
        this.firstError = false;

        this.options = $.extend({}, $.fn[widgetName].defualtOptions, options);
        this.options.template = $(this.options.template).addClass(theme.base + theme[this.options.theme])[0].outerHTML;

        this.elements = this.getElements(this.el)
            .on('valid.' + widgetName, $.proxy(validElement, this))
            .on('invalid.' + widgetName, $.proxy(invalidElement, this));

        this.el.noValidate = true;
        this.$el.on('submit.' + widgetName, $.proxy(submitForm, this));
        this.$el.on('reset.' + widgetName, $.proxy(resetForm, this));
    }

    function bindElements() {
        /*jshint validthis:true */

        this.elements.on({
            'focus.validatrelement': bindEvents,
            'blur.validatrelement': unbindEvents 
        });

        $('input[type=radio]').on('click.validatrelement', function (e) {
            validateElement(e.target);
        });
    }

    function unbindElements() {
        /*jshint validthis:true */

        this.elements.off('.validatrelement');
    }

    function bindEvents (e) {
        var target = e.target;

        $(target).on({
            'change.validatrinput': function () {
                setTimeout(function () {
                    validateElement(target);                
                }, 1);
            },
            'blur.validatrinput': function () {
                validateElement(target);                
            },
            'keyup.validatrinput': function () {
                if (target.value.length) {
                    validateElement(target);
                }                
            }
        });
    }

    function unbindEvents(e) {
        $(e.target).off('.validatrinput');
    }

    function validateElement(element) {
        if (element.type === 'radio') {
            var radio = $(document.getElementsByName(element.name)).filter('[required]');
            if (radio.length) {
                element = radio[0];
            }
        }

        var $element = $(element),
            type = element.getAttribute('type'),
            required = Support.input.required ? element.required : isRequired(element),
            check = {
                valid: true
            };


        if (element.willValidate) {
            check.valid = element.checkValidity();
            
            if (!check.valid) {
                return false;
            } 
        } else {
            if (required) {
                check = Tests.required(element);
            }   

            if (check.valid && element.value.length && !Rules.boxes.test(type)) {
                if (element.pattern) {
                    type = 'pattern';
                }

                if (Tests[type]) {
                    check = Tests[type](element);
                }
            }
        }

        if (check.valid) {
            for (var test in CustomTests) {
                if (CustomTests.hasOwnProperty(test) && $element.data(test)) {
                    check = CustomTests[test](element);
                    if (!check.valid) {
                        break;
                    }
                }
            }
        }

        if (check.valid) {
            $element.trigger('valid');
            return true;
        } 

        $.data(element, 'validationMessage', check.message);
        $element.trigger('invalid');
        
        return false;
    }

    function validateForm (elements) {
        var valid = true;        

        elements.each(function (i, element) {
            if (!validateElement(element)) {
                valid = false;
            }
        });

        return valid;
    }

    function submitForm() {
        /*jshint validthis:true */

        this.isSubmit = true;
        resetForm.call(this);
        var valid = validateForm(this.elements);

        if (valid) {
            return this.options.valid.call(this.el, this.el);
        } else {
            bindElements.call(this);
            this.firstError.focus();
        }

        this.isSubmit = false;
        return valid;
    }

    function resetForm() {
        /*jshint validthis:true */

        unbindElements.call(this);
        this.firstError = false;
        this.$el.find('.validatr-message').remove();
    }

    function isRequired(element) {
        if (element.required) {
            return element.required === 'true';
        }

        var attrs = element.attributes,
            length = attrs.length,
            x = 0;

        for (x; x < length; x += 1) {
            if (attrs[x].name === 'required') {
                element.required = "true";
                return true;
            }
        }

        element.required = "false";
        return false;
    }

    function invalidElement(e) {
        /*jshint validthis:true */

        if (supressError) {
            return;
        }

        e.preventDefault();

        var target = e.target,
            $target = $(target),
            msg = target.validationMessage || $.data(target, 'validationMessage'),
            options = this.options,
            error = $(options.template.replace('{{message}}', msg));


        if (this.isSubmit && !this.firstError) {
            this.firstError = $target.after(error);
            options.position.call(this, error, $target);
            return;
        }

        if (!this.isSubmit || options.showall) {
            validElement(e);
            $target.after(error);
            options.position.call(this, error, $target);
        }
    }

    function validElement(e) {
        $(e.target).next('.validatr-message').remove();
    }

    function position(error, $target) {
        /*jshint validthis:true */
        error.css('position', 'absolute');

        var offset = $target.offset(),
            location = $target.data('location') || this.options.location;

        if (Rules.topbottom.test(location)) {
            error.offset({left: offset.left});

            if (location === 'top') {
                error.offset({top: offset.top - error.outerHeight() - 2});
            }

            if (location === 'bottom') {
                error.offset({top: offset.top + error.outerHeight()});
            }            
        } else if (Rules.leftright.test(location)) {
            error.offset({top: (offset.top + $target.outerHeight() / 2) - (error.outerHeight() / 2)});

            if (location === 'left') {
                error.offset({left: offset.left - error.outerWidth() - 2});
            }

            if (location === 'right') {
                error.offset({left: offset.left + $target.outerWidth() + 2});
            }            
        }        
    }

    /*! Inspired by jQuery UI - v1.9.2 - 2012-12-04
     * http://jqueryui.com
     * Copyright (c) 2012 jQuery Foundation and other contributors Licensed MIT 
     */
    $.fn[widgetName] = function(options) {
        var isMethod = typeof options === 'string',
            args = Array.prototype.slice.call(arguments, 1),
            returnValue = this,
            instance;

        if (isMethod) {
            this.each(function() {
                var methodValue;
                
                instance = $.data(this, widgetName);
                if (!instance) {
                    throw new Error("cannot call methods on " + widgetName + " prior to initialization; attempted to call method '" + options + "'" );
                }
                if (!$.isFunction(instance[options])) {
                    throw new Error( "no such method '" + options + "' for " + widgetName + " widget instance" );
                }

                methodValue = instance[options].apply(instance, args);
                if (methodValue !== instance && methodValue !== undefined) {
                    returnValue = methodValue && methodValue.jquery ? returnValue.pushStack( methodValue.get() ) : methodValue;
                    return false;
                }
            });
        } else {
            var widget;
            this.each(function() {
                instance = $.data(this, widgetName);
                if (!instance) {
                    widget = new Widget();
                    init.call(widget, this, options || {});
                    $.data(this, widgetName, widget);
                }
            });
        }

        return returnValue;
    };

    $.fn[widgetName].defualtOptions = {
        showall: false,
        location: 'right',
        position: position,
        template: '<div>{{message}}</div>',
        theme: 'none',
        valid: $.noop
    };

    $[widgetName] = new Widget();

    // Custom selector.
    $.expr[':'][widgetName] = function(elem) {
        return elem.textContent.indexOf(widgetName) >= 0;
    };

}(this, this.document, jQuery));
