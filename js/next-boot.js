/* global NexT, CONFIG, Velocity */

var Affix = {
  init: function(element, options) {
    this.element = element;
    this.offset = options || 0;
    this.affixed = null;
    this.unpin = null;
    this.pinnedOffset = null;
    this.checkPosition();
    window.addEventListener('scroll', this.checkPosition.bind(this));
    window.addEventListener('click', this.checkPositionWithEventLoop.bind(this));
    window.matchMedia('(min-width: 992px)').addListener(event => {
      if (event.matches) {
        this.offset = NexT.utils.getAffixParam();
        this.checkPosition();
      }
    });
  },
  getState: function(scrollHeight, height, offsetTop, offsetBottom) {
    let scrollTop = window.scrollY;
    let targetHeight = window.innerHeight;
    if (offsetTop != null && this.affixed === 'top') {
      if (document.querySelector('.content-wrap').offsetHeight < offsetTop) return 'top';
      return scrollTop < offsetTop ? 'top' : false;
    }
    if (this.affixed === 'bottom') {
      if (offsetTop != null) return this.unpin <= this.element.getBoundingClientRect().top ? false : 'bottom';
      return scrollTop + targetHeight <= scrollHeight - offsetBottom ? false : 'bottom';
    }
    let initializing = this.affixed === null;
    let colliderTop = initializing ? scrollTop : this.element.getBoundingClientRect().top + scrollTop;
    let colliderHeight = initializing ? targetHeight : height;
    if (offsetTop != null && scrollTop <= offsetTop) return 'top';
    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom';
    return false;
  },
  getPinnedOffset: function() {
    if (this.pinnedOffset) return this.pinnedOffset;
    this.element.classList.remove('affix-top', 'affix-bottom');
    this.element.classList.add('affix');
    return (this.pinnedOffset = this.element.getBoundingClientRect().top);
  },
  checkPositionWithEventLoop() {
    setTimeout(this.checkPosition.bind(this), 1);
  },
  checkPosition: function() {
    if (window.getComputedStyle(this.element).display === 'none') return;
    let height = this.element.offsetHeight;
    let { offset } = this;
    let offsetTop = offset.top;
    let offsetBottom = offset.bottom;
    let { scrollHeight } = document.body;
    let affix = this.getState(scrollHeight, height, offsetTop, offsetBottom);
    if (this.affixed !== affix) {
      if (this.unpin != null) this.element.style.top = '';
      let affixType = 'affix' + (affix ? '-' + affix : '');
      this.affixed = affix;
      this.unpin = affix === 'bottom' ? this.getPinnedOffset() : null;
      this.element.classList.remove('affix', 'affix-top', 'affix-bottom');
      this.element.classList.add(affixType);
    }
    if (affix === 'bottom') {
      this.element.style.top = scrollHeight - height - offsetBottom + 'px';
    }
  }
};

NexT.utils.getAffixParam = function() {
  const sidebarOffset = CONFIG.sidebar.offset || 12;

  let headerOffset = document.querySelector('.header-inner').offsetHeight;
  let footerOffset = document.querySelector('.footer').offsetHeight;

  document.querySelector('.sidebar').style.marginTop = headerOffset + sidebarOffset + 'px';

  return {
    top   : headerOffset,
    bottom: footerOffset
  };
};

NexT.boot = {};

NexT.boot.registerEvents = function() {

  NexT.utils.registerScrollPercent();
  NexT.utils.registerCanIUseTag();

  // Mobile top menu bar.
  document.querySelector('.site-nav-toggle .toggle').addEventListener('click', () => {
    event.currentTarget.classList.toggle('toggle-close');
    var siteNav = document.querySelector('.site-nav');
    var animateAction = siteNav.classList.contains('site-nav-on') ? 'slideUp' : 'slideDown';

    if (typeof Velocity === 'function') {
      Velocity(siteNav, animateAction, {
        duration: 200,
        complete: function() {
          siteNav.classList.toggle('site-nav-on');
        }
      });
    } else {
      siteNav.classList.toggle('site-nav-on');
    }
  });

  var TAB_ANIMATE_DURATION = 200;
  document.querySelectorAll('.sidebar-nav li').forEach((element, index) => {
    element.addEventListener('click', event => {
      var item = event.currentTarget;
      var activeTabClassName = 'sidebar-nav-active';
      var activePanelClassName = 'sidebar-panel-active';
      if (item.classList.contains(activeTabClassName)) return;

      var targets = document.querySelectorAll('.sidebar-panel');
      var target = targets[index];
      var currentTarget = targets[1 - index];
      window.anime({
        targets : currentTarget,
        duration: TAB_ANIMATE_DURATION,
        easing  : 'linear',
        opacity : 0,
        complete: () => {
          // Prevent adding TOC to Overview if Overview was selected when close & open sidebar.
          currentTarget.classList.remove(activePanelClassName);
          target.style.opacity = 0;
          target.classList.add(activePanelClassName);
          window.anime({
            targets : target,
            duration: TAB_ANIMATE_DURATION,
            easing  : 'linear',
            opacity : 1
          });
        }
      });

      [...item.parentNode.children].forEach(element => {
        element.classList.remove(activeTabClassName);
      });
      item.classList.add(activeTabClassName);
    });
  });

  window.addEventListener('resize', NexT.utils.initSidebarDimension);

  window.addEventListener('hashchange', () => {
    var tHash = location.hash;
    if (tHash !== '' && !tHash.match(/%\S{2}/)) {
      var target = document.querySelector(`.tabs ul.nav-tabs li a[href="${tHash}"]`);
      target && target.click();
    }
  });
};

NexT.boot.refresh = function() {

  /**
   * Register JS handlers by condition option.
   * Need to add config option in Front-End at 'layout/_partials/head.swig' file.
   */
  CONFIG.fancybox && NexT.utils.wrapImageWithFancyBox();
  CONFIG.mediumzoom && window.mediumZoom('.post-body :not(a) > img, .post-body > img');
  CONFIG.lazyload && window.lozad('.post-body img').observe();
  CONFIG.pangu && window.pangu.spacingPage();

  CONFIG.exturl && NexT.utils.registerExtURL();
  CONFIG.copycode.enable && NexT.utils.registerCopyCode();
  NexT.utils.registerTabsTag();
  NexT.utils.registerActiveMenuItem();
  NexT.utils.registerLangSelect();
  NexT.utils.registerSidebarTOC();
  NexT.utils.wrapTableWithBox();
  NexT.utils.registerVideoIframe();
};

NexT.boot.motion = function() {
  // Define Motion Sequence & Bootstrap Motion.
  if (CONFIG.motion.enable) {
    NexT.motion.integrator
      .add(NexT.motion.middleWares.logo)
      .add(NexT.motion.middleWares.menu)
      .add(NexT.motion.middleWares.postList)
      .add(NexT.motion.middleWares.sidebar)
      .bootstrap();
  }
  NexT.utils.updateSidebarPosition();
};

document.addEventListener('DOMContentLoaded', () => {
  Affix.init(document.querySelector('.sidebar-inner'), NexT.utils.getAffixParam());
  NexT.boot.registerEvents();
  NexT.boot.refresh();
  NexT.boot.motion();
});
