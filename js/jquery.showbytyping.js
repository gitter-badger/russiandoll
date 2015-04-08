// Typing effect

$.fn.showByTyping = function () {

  var $this = this;

  (function typeFirstInQueue ($queue){

    var $part = $queue.first();

    // Get initial html
    var html = $part.html();

    $part.find('span').remove();
    var text = $part.text();

    $part.hide().text('').show().addClass('typing');

    (function typeLetters (end){

      if (end == ++text.length) {

        $part.attr('data-html', html);

        if ($queue.length > 1) {

          $part.removeClass('typing');
          typeFirstInQueue($queue.slice(1));

        } else {

          $this.each(function(){
            $(this)
              .html($(this).attr('data-html'))
              .removeAttr('data-html');
          });

          setTimeout(function(){
            $part.removeClass('typing');
          }, 2000);

        }

        return;

      }

      setTimeout(function(){

        $part.append(text.substr(end - 1, 1));
        typeLetters(end + 1);

      }, Math.round(Math.random() * 100) + 25);

    })(1);

  })($this);

  return $this;

};