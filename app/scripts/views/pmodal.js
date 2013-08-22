/*global PreLinked, Backbone, JST*/

var _setModalOptions = function(options){
  //overwrite the default template
  //Set custom template settings
  var _interpolateBackup = _.templateSettings;
  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g,
    evaluate: /<%([\s\S]+?)%>/g
  };

  //http://jslinterrors.com/bad-escapement-of-eol-use-option-multistr-if-needed/
  /*jshint multistr: true */
  var template = _.template('\
    <% if (title) { %>\
      <div class="modal-header">\
        <% if (allowCancel) { %>\
          <a class="close-reveal-modal">&times;</a>\
        <% } %>\
        <h3>{{title}}</h3>\
      </div>\
    <% } %>\
           \
    <div class="modal-body">{{content}}</div>\
           \
    <% if (footer) { %>\
      <div class="modal-footer">\
        <% if (allowCancel) { %>\
          <% if (cancelText) { %>\
            <a href="#" class="button cancel radius">{{cancelText}}</a>\
          <% } %>\
        <% } %>\
        <a href="#" class="button ok radius success">{{okText}}</a>\
      </div>\
    <% } %>\
  ');

  //Reset to users' template settings
  _.templateSettings = _interpolateBackup;

  //OVERRIDE templates
  options.template = template;

  //enable footer by default
  if(options.footer === undefined){
    options.footer = true;
  }

  return options;
};



PreLinked.Views.PmodalView = Backbone.View.extend({

  template: JST['app/scripts/templates/pmodal.hbs'],

  pmodal: Backbone.View.extend({

    className: 'modal reveal-modal',

    events: {
      'click .close': function(event) {
        event.preventDefault();

        this.trigger('cancel');

        if (this.options.content && this.options.content.trigger) {
          this.options.content.trigger('cancel', this);
        }
      },
      'click .cancel': function(event) {
        event.preventDefault();

        this.trigger('cancel');

        if (this.options.content && this.options.content.trigger) {
          this.options.content.trigger('cancel', this);
        }

        this.close(); //the best place for this line?
      },
      'click .ok': function(event) {
        event.preventDefault();

        this.trigger('ok');

        if (this.options.content && this.options.content.trigger) {
          this.options.content.trigger('ok', this);
        }

        if (this.options.okCloses) {
          this.close();
        }
      }
    },

    /**
     * Creates an instance of a Bootstrap Modal
     *
     * @see http://twitter.github.com/bootstrap/javascript.html#modals
     *
     * @param {Object} options
     * @param {String|View} [options.content] Modal content. Default: none
     * @param {String} [options.title]        Title. Default: none
     * @param {String} [options.okText]       Text for the OK button. Default: 'OK'
     * @param {String} [options.cancelText]   Text for the cancel button. Default: 'Cancel'. If passed a falsey value, the button will be removed
     * @param {Boolean} [options.allowCancel  Whether the modal can be closed, other than by pressing OK. Default: true
     * @param {Boolean} [options.escape]      Whether the 'esc' key can dismiss the modal. Default: true, but false if options.cancellable is true
     * @param {Boolean} [options.animate]     Whether to animate in/out. Default: false
     * @param {Function} [options.template]   Compiled underscore template to override the default one
     */
    initialize: function(options) {
      options = _setModalOptions(options);
      this.options = _.extend({
        title: null,
        okText: 'OK',
        focusOk: true,
        okCloses: true,
        cancelText: 'Cancel',
        allowCancel: true,
        escape: true,
        animate: false
        // template: template
      }, options);
    },

    /**
     * Creates the DOM element
     *
     * @api private
     */
    render: function() {
      var $el = this.$el,
          options = this.options,
          content = options.content;

      //Create the modal container
      $el.html(options.template(options));

      var $content = this.$content = $el.find('.modal-body')

      //Insert the main content if it's a view
      if (content.$el) {
        content.render();
        $el.find('.modal-body').html(content.$el);
      }

      if (options.animate) $el.addClass('fade');

      this.isRendered = true;


      return this;
    },

    /**
     * Renders and shows the modal
     *
     * @param {Function} [cb]     Optional callback that runs only when OK is pressed.
     */
    open: function(cb) {
      if (!this.isRendered) this.render();

      $('body').append(this.$el);

      var self = this,
          $el = this.$el;

      $el.foundation('reveal', 'open');

      // //Create it
      // $el.modal(_.extend({
      //   keyboard: this.options.allowCancel,
      //   backdrop: this.options.allowCancel ? true : 'static'
      // }, this.options.modalOptions));

      // //Focus OK button
      // $el.one('shown', function() {
      //   if (self.options.focusOk) {
      //     $el.find('.btn.ok').focus();
      //   }

      //   if (self.options.content && self.options.content.trigger) {
      //     self.options.content.trigger('shown', self);
      //   }

      //   self.trigger('shown');
      // });

      // //Adjust the modal and backdrop z-index; for dealing with multiple modals
      // var numModals = Modal.count,
      //     $backdrop = $('.modal-backdrop:eq('+numModals+')'),
      //     backdropIndex = parseInt($backdrop.css('z-index'),10),
      //     elIndex = parseInt($backdrop.css('z-index'), 10);

      // $backdrop.css('z-index', backdropIndex + numModals);
      // this.$el.css('z-index', elIndex + numModals);

      // if (this.options.allowCancel) {
      //   $backdrop.one('click', function() {
      //     if (self.options.content && self.options.content.trigger) {
      //       self.options.content.trigger('cancel', self);
      //     }

      //     self.trigger('cancel');
      //   });

      //   $(document).one('keyup.dismiss.modal', function (e) {
      //     e.which == 27 && self.trigger('cancel');

      //     if (self.options.content && self.options.content.trigger) {
      //       e.which == 27 && self.options.content.trigger('shown', self);
      //     }
      //   });
      // }

      // this.on('cancel', function() {
      //   self.close();
      // });

      // Modal.count++;

      // //Run callback on OK if provided
      // if (cb) {
      //   self.on('ok', cb);
      // }

      return this;
    },

    /**
     * Closes the modal
     */
    close: function() {
      var self = this,
          $el = this.$el;

      //Check if the modal should stay open
      if (this._preventClose) {
        this._preventClose = false;
        return;
      }

      $el.one('hidden', function onHidden(e) {
        // Ignore events propagated from interior objects, like bootstrap tooltips
        if(e.target !== e.currentTarget){
          return $el.one('hidden', onHidden);
        }
        self.remove();

        if (self.options.content && self.options.content.trigger) {
          self.options.content.trigger('hidden', self);
        }

        self.trigger('hidden');
      });

      $el.foundation('reveal', 'close');

    },

    /**
     * Stop the modal from closing.
     * Can be called from within a 'close' or 'ok' event listener.
     */
    preventClose: function() {
      this._preventClose = true;
    }
  }), //close pmodal

});