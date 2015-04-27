$(function(){

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
  $(document).on('click', '#preview.interactive a[data-rd-opens-id]:not(.rd-opened)', function(e){
    e.preventDefault();
    var id = $(this).attr('data-rd-opens-id');
    $('[data-rd-openedby-id="' + id + '"]').showByTyping();
    $(this).addClass('rd-opened');
  });

  $(document).on('click', '#preview.interactive a[data-rd-opens-i]:not(.rd-opened)', function(e){
    e.preventDefault();
    var i = $(this).attr('data-rd-opens-i');
    $('[data-rd-openedby-i="' + i + '"]').showByTyping();
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

});