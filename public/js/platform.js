'use strict'

$(() => {
  matchHeight()
  $(window).resize(matchHeight);
})




function matchHeight(){
    // Select and loop the container element of the elements you want to equalise
    $('.outliner').css('height','auto')
    $('.flex-container').each(function(){
      // Cache the highest
      console.log("I'm-a runnin!")
      var highestBox = 0;
      // Select and loop the elements you want to equalise
      $('.outliner', this).each(function(){
        // If this box is higher than the cached highest then store it
        if($(this).height() > highestBox) {
          highestBox = $(this).height();
        }
      });
      // Set the height of all those children to whichever was highest
      $('.outliner',this).height(highestBox);
    });
}
