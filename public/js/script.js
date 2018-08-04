'use strict'

var hasSly = false;

$(window).resize(function(e) {
  var $frame = $('#centered');  
  if ($(window).width()	> 768){
    if (!hasSly) initSly();
    $frame.sly('reload');
  }
  else {
    if (hasSly) {
      $frame.sly('destroy');
      hasSly = false;
    }
  }
});
function initSly(){
  hasSly = true;
  var $frame = $('#centered');
  var $wrap  = $frame.parent();
  $frame.sly({
    horizontal: 1,
    itemNav: 'forceCentered',
    smart: 1,
    activateMiddle: 1,
    activateOn: 'click',
    mouseDragging: 1,
    touchDragging: 1,
    releaseSwing: 1,
    startAt: 1,
    speed: 300,
    elasticBounds: 0,
    dragHandle: 1,
    dynamicHandle: 1,
    clickBar: 1,
  });
}
$(() => {

  // -------------------------------------------------------------
	//   Centered Navigation
	// -------------------------------------------------------------
		
    if ($(window).width()	> 768){
      initSly();
    }
  
  if (!(navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))){
    $(".filled-gradient-btn").mousemove(function( event ) {
      var w = $(this).width(),
          pct = 360*(+event.pageX)/w,
          bg = "linear-gradient(" + pct + "deg,#28eaed,#1167f5)";
          $(this).css("background-image", bg);
    });
    $(".voice-button").mousemove(function( event ) {
      var w = $(this).width(),
          pct = 360*(+event.pageX)/w,
          bg = "linear-gradient(" + pct + "deg,#28eaed,#1167f5)";
          $(this).css("background-image", bg);
    });
  }
})
