//= require ../lib/_jquery
//= require ../lib/_jquery_ui
//= require ../lib/_jquery.tocify
//= require ../lib/_imagesloaded.min
(function (global) {
  'use strict';

  var closeToc = function() {
    $(".tocify-wrapper").removeClass('open');
    $("#nav-button").removeClass('open');
  };
  function cleanSname(sname){
    var cwhitelist = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"+"-";
    var new_sname = sname.split("");
    for (var i=0; i<new_sname.length; i++){
      if (cwhitelist.indexOf(new_sname[i]) == -1) new_sname[i] = "";
    }
    var jsname = new_sname.join("");
    while (jsname.indexOf("nbsp") > -1) jsname = jsname.replace("nbsp", "");
    while (jsname[0] == "-") jsname = jsname.substr(1);
    return jsname;
  }

  var makeToc = function() {
    global.toc = $("#toc").tocify({
      selectors: 'h1, h2, h3',
      extendPage: false,
      theme: 'none',
      smoothScroll: false,
      showEffectSpeed: 0,
      hideEffectSpeed: 180,
      ignoreSelector: '.toc-ignore',
      highlightOffset: 60,
      scrollTo: -1,
      scrollHistory: true,
      hashGenerator: function (text, element) {
        var sectionName = element.prevUntil('h1').andSelf().prev('h1').andSelf().first();
        if(element.is('h3')){
          var subSectionName = element.prevUntil('h2').andSelf().prev('h2').andSelf().first();
          var sname = (sectionName.text()).toLowerCase().replace(' ','-')+'-'+ (subSectionName.text()).toLowerCase().replace(' ','-')+'-'+element.prop('id');
          sname = cleanSname(sname);
          return sname;
        } else if(element.is('h2')){
          var sname = (sectionName.text()).toLowerCase().replace(' ','-')+'-'+element.prop('id');
          sname = cleanSname(sname);
          return sname;
        } else if (element.is('h1')) {
          var sname = element.prop('id');
          sname = cleanSname(sname);
          return sname;
        }
      }
    }).data('toc-tocify');

    $("#nav-button").click(function() {
      $(".tocify-wrapper").toggleClass('open');
      $("#nav-button").toggleClass('open');
      return false;
    });

    $(".page-wrapper").click(closeToc);
    $(".tocify-item").click(closeToc);
  };

  // Hack to make already open sections to start opened,
  // instead of displaying an ugly animation
  function animate() {
    setTimeout(function() {
      toc.setOption('showEffectSpeed', 180);
    }, 50);
  }

  $(function() {
    makeToc();
    animate();
    setupLanguages($('body').data('languages'));
    $('.content').imagesLoaded( function() {
      global.toc.calculateHeights();
    });
  });
})(window);

