$(function(){

  var fs;
  try {
    fs = require('fs');
  } catch (e) {
    fs = false;
  }

  /* Animate icon */
  $('#separator-icon').lazylinepainter({
    "svgData": separatorIconPath,
    "strokeWidth": 6,
    "strokeColor": "#B5B5B5",
    "onComplete": function(e) {
      $(this).addClass('animated');
    }
  }).lazylinepainter('paint');

  var $preview = $('#preview #preview-content');

  /* Editor initialization */
  var editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
    // mode: 'text/x-haml',
    theme: 'neo',
    keyMap: 'sublime',
    smartIndent: false,
    tabSize: 2,
    indentUnit: 2,
    indentWithTabs: true,
    electricChars: false,
    lineWrapping: true,
    dragDrop: false,
    showCursorWhenSelecting: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    lineNumbers: true
  });

  /* Editor size */
  editor.setSize('calc(50% - 8px)', '100%');

  /* Indented wraps */
  var charWidth = editor.defaultCharWidth(), basePadding = 2;
  editor.on("renderLine", function(cm, line, elt) {
    var off = CodeMirror.countColumn(line.text, null, cm.getOption("tabSize")) * charWidth;
    elt.style.textIndent = "-" + off + "px";
    elt.style.paddingLeft = (basePadding + off) + "px";
  });
  editor.refresh();

  var $errors = $('#editor-errors');

  /* Live preview */
  var renderPreview = function () {

    try {

      var russianDoll = new RussianDoll(editor.getValue());
      $preview.html(russianDoll.html);
      window.tree = russianDoll.tree; // DEV

      $('#editor-errors').hide();
      $('#editor-errors-line').hide();

    } catch (e) {

      var error = JSON.parse(e.message);

      $errors.find('#editor-errors-message').text(error.message);
      if (error.line) {
        $('#editor-errors-line span').text(error.line)
        $('#editor-errors-line').show()
      }
      $errors.show();

    }

  };

  var delay;
  editor.on("change", function() {
    clearTimeout(delay);
    delay = setTimeout(renderPreview, 300);
  });
  setTimeout(renderPreview, 300);

  /* Mode toggling */

  $('#inspector-button').on('click', function(e){
    if ($(this).hasClass('on')) return;
    $(this).addClass('on');
    $('#interactive-button').removeClass('on');
    $('#preview').removeClass('interactive').addClass('inspector');
    renderPreview();
  });
  $('#interactive-button').on('click', function(e){
    if ($(this).hasClass('on')) return;
    $(this).addClass('on');
    $('#inspector-button').removeClass('on');
    $('#preview').removeClass('inspector').addClass('interactive');
    renderPreview();
  });

  /* Interactive actions */
  $(document).on('click', '#preview.interactive a[data-rd-opens-id]', function(e){
    e.preventDefault();
    var id = $(this).attr('data-rd-opens-id');
    $('[data-rd-openedby-id="' + id + '"]').show();
    $(this).addClass('rd-opened');
  });

  $(document).on('click', '#preview.interactive a[data-rd-opens-i]', function(e){
    e.preventDefault();
    var i = $(this).attr('data-rd-opens-i');
    $('[data-rd-openedby-i="' + i + '"]').show();
    $(this).addClass('rd-opened');
  });

  /* Inspector actions */
  $(document).on('mouseenter', '#preview.inspector a[data-rd-opens-i]', function(e){
    var i = $(this).attr('data-rd-opens-i');
    $(this).add('[data-rd-openedby-i="' + i + '"]').addClass('hovered');
  });

  $(document).on('mouseleave', '#preview.inspector a[data-rd-opens-i]', function(e){
    var i = $(this).attr('data-rd-opens-i');
    $(this).add('[data-rd-openedby-i="' + i + '"]').removeClass('hovered');
  });

  $(document).on('mouseenter', '#preview.inspector a[data-rd-opens-id]', function(e){
    var id = $(this).attr('data-rd-opens-id');
    $(this).add('[data-rd-openedby-id="' + id + '"]').addClass('hovered');
  });

  $(document).on('mouseleave', '#preview.inspector a[data-rd-opens-id]', function(e){
    var id = $(this).attr('data-rd-opens-id');
    $(this).add('[data-rd-openedby-id="' + id + '"]').removeClass('hovered');
  });

  /* File save */

  var $saveInput = $('<input type="file" nwsaveas="Untitled.rdl" style="display: none;" />');
  $('body').append($saveInput);

  $saveInput.on('change', function(e){
    if (!fs) return;
    fs.writeFileSync(this.value, editor.getValue());
  });

  /* File open */

  var $openInput = $('<input type="file" accept=".rdl,.txt" style="display: none;" />');
  $('body').append($openInput);

  $openInput.on('change', function(e){

    if (!fs) return;

    fs.readFile(this.value, function(err, data){
      if (!err) editor.setValue(data.toString());
    });

  });

  /* OSX Menus */

  var gui = require('nw.gui');
  var mb = new gui.Menu({ type : "menubar" });

  mb.createMacBuiltin("Russiandoll", {
    hideWindow: true
  });

  var Window = gui.Window.get();
  Window.menu = mb;

  var file = new gui.Menu();

  file.append(new gui.MenuItem({
    label: 'Open',
    modifiers: 'cmd',
    key: 'o',
    click: function () {
      $openInput.trigger('click');
    }
  }));

  file.append(new gui.MenuItem({
    label: 'Save As',
    modifiers: 'cmd',
    key: 's',
    click: function () {
      $saveInput.trigger('click');
    }
  }));

  Window.menu.insert(new gui.MenuItem({ label: 'File', submenu: file }), 1);

});