$(document).ready(function () {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  ScrollTrigger.create({
    start: "top top",
    end: 99999,
    onUpdate: (self) => {
      const currentScroll = self.scroll();
      const section02Top = $(".section02").offset().top - 10;
      const historyTop = $(".info-history-horizontal").offset().top;
      const section03Top = $(".section03").offset().top - 10;
      const section04Top = $(".section04").offset().top - 10;

      const isZoomArea =
        currentScroll > historyTop + 4500 && currentScroll < section03Top;

      if (currentScroll > section02Top) {
        if (self.direction === 1 || isZoomArea) {
          gsap.to("#header", {
            yPercent: -100,
            duration: 0.1,
            ease: "power1.out",
          });
        } else {
          gsap.to("#header", {
            yPercent: 0,
            duration: 0.1,
            ease: "power1.out",
          });

          if (currentScroll < section03Top) {
            $("#header").addClass("dark");
          } else if (
            currentScroll >= section03Top &&
            currentScroll < section04Top
          ) {
            $("#header").removeClass("dark");
          } else if (currentScroll >= section04Top) {
            $("#header").addClass("dark");
          }
        }
      } else {
        gsap.to("#header", { yPercent: 0, duration: 0.1, ease: "power1.out" });
        $("#header").removeClass("dark");
      }
    },
  });

  // 공통  ============================
  $("#header").on("mouseenter", function () {
    if ($(window).width() > 1024) $(this).addClass("open");
  });
  $("#header").on("mouseleave", function () {
    if ($(window).width() > 1024) $(this).removeClass("open");
  });

  $(".all_menu a").on("click", function (e) {
    e.preventDefault();
    $(".header_wrap").addClass("m_open");
    $("body").css("overflow", "hidden");
  });

  $(".m_close").on("click", function () {
    $(".header_wrap").removeClass("m_open");
    $("body").css("overflow", "auto");
    $(".gnb > li").removeClass("active");
    $(".depth2_wrap").hide();
  });

  $(".header_wrap .gnb > li > a")
    .off("click")
    .on("click", function (e) {
      if ($(window).width() <= 1024) {
        e.preventDefault();
        const $thisLi = $(this).parent("li");
        const $targetDepth = $thisLi.find(".depth2_wrap");
        $thisLi
          .siblings("li")
          .removeClass("active")
          .find(".depth2_wrap")
          .stop()
          .slideUp(300);
        $thisLi.toggleClass("active");
        $targetDepth.stop().slideToggle(300);
      }
    });

  // section01 - video ============
  const video = document.getElementById("intro_video");
  const progressBar = $(".video-progress-bar");
  const videoBtn = $(".video-ctrl-btn");

  if (video) {
    videoBtn.on("click", function () {
      if (video.paused) {
        video.play();
        video.muted = false;
        $(this).removeClass("play");
      } else {
        video.pause();
        $(this).addClass("play");
      }
    });

    video.addEventListener("timeupdate", function () {
      const percentage = (video.currentTime / video.duration) * 100;
      progressBar.css("width", percentage + "%");
    });
  }

  // section01 -> section02
  ScrollTrigger.create({
    trigger: ".section01",
    start: "top top",
    end: "bottom center",
    onLeave: () => {
      gsap.to(window, {
        scrollTo: "#information",
        duration: 1.2,
        ease: "power2.inOut",
      });
    },
  });

  // section02 - history
  const items = gsap.utils.toArray(".history-item");
  const visuals = gsap.utils.toArray(".visual-item");
  const track = document.querySelector(".history-track");
  const zoomBg = document.querySelector(".history-zoom-bg");
  const zoomContent = document.querySelector(".history-zoom-content");
  const pgBar = document.querySelector(".pg-bar-active");
  const currIdxTxt = document.querySelector(".curr-idx");

  ScrollTrigger.matchMedia({
    "(min-width: 769px)": function () {
      const historyTL = gsap.timeline({
        scrollTrigger: {
          trigger: ".info-history-horizontal",
          start: "top top",
          end: "+=12000",
          scrub: 1,
          pin: true,
          snap: {
            snapTo: 1 / (items.length - 1),
            duration: 0.3,
            delay: 0,
            ease: "power1.inOut",
          },
          onUpdate: (self) => {
            if (self.progress < 0.4) {
              gsap.set([zoomBg, zoomContent], {
                visibility: "hidden",
                opacity: 0,
              });
            }
            if (self.progress === 0) {
              items.forEach((item) =>
                item.querySelector(".big-year").classList.remove("counted"),
              );
            }
          },
        },
      });

      items.forEach((item, i) => {
        const targetYear = parseInt(item.querySelector(".big-year").innerText);
        const moveX =
          i === items.length - 1
            ? -(item.offsetLeft - window.innerWidth * 0.05)
            : -(item.offsetLeft - window.innerWidth * 0.1);

        historyTL.to(
          track,
          {
            x: moveX,
            duration: 1,
            ease: "none",
            onUpdate: function () {
              const isCurrent = this.progress() > 0.5;
              if (isCurrent) {
                visuals.forEach((v, idx) =>
                  v.classList.toggle("active", idx === i),
                );
                items.forEach((it, idx) =>
                  it.classList.toggle("active", idx === i),
                );
                if (pgBar)
                  pgBar.style.width = `${((i + 1) / items.length) * 100}%`;
                if (currIdxTxt) currIdxTxt.innerText = `0${i + 1}`;
                const yearEl = item.querySelector(".big-year");
                if (!yearEl.classList.contains("counted")) {
                  yearEl.classList.add("counted");
                  gsap.fromTo(
                    yearEl,
                    { innerText: targetYear - 10 },
                    {
                      innerText: targetYear,
                      duration: 0.5,
                      snap: { innerText: 1 },
                      ease: "power2.out",
                    },
                  );
                }
              }
            },
          },
          i === 0 ? 0 : ">",
        );
      });

      historyTL.to({}, { duration: 0.5 });
      historyTL
        .to(".history-wrapper", { autoAlpha: 0, duration: 0.5 })
        .to(".info-history-horizontal", {
          onStart: () => $(".info-history-horizontal").addClass("show-fog"),
          onReverseComplete: () =>
            $(".info-history-horizontal").removeClass("show-fog"),
          duration: 0.1,
        })
        .set([zoomBg, zoomContent], { visibility: "visible" })
        .to(zoomBg, {
          opacity: 1,
          scale: 1,
          duration: 1.5,
          ease: "power2.inOut",
        })
        .to(
          zoomContent,
          {
            opacity: 1,
            duration: 1,
            onStart: () => {
              const countNum = document.querySelector(".count-num");
              if (countNum) {
                gsap.fromTo(
                  countNum,
                  { innerText: 0 },
                  {
                    innerText: 65,
                    duration: 1.5,
                    snap: { innerText: 1 },
                    ease: "power2.out",
                  },
                );
              }
            },
          },
          "-=0.5",
        )
        .to(".section03", {
          marginTop: 0,
          duration: 1.5,
          ease: "power2.inOut",
        });
    },

    "(max-width: 768px)": function () {
      gsap.set([zoomBg, zoomContent], { visibility: "hidden", opacity: 0 });

      const mHistoryTL = gsap.timeline({
        scrollTrigger: {
          trigger: ".info-history-horizontal",
          start: "top top",
          end: "+=4000",
          scrub: 1,
          pin: true,
          
          onUpdate: (self) => {
            if (self.progress > 0.8) {
              
              gsap.set([zoomBg, zoomContent], {
                visibility: "visible",
                opacity: 1,
              });
            }
            else{
              gsap.set([zoomBg, zoomContent], {
                visibility: "hidden",
                opacity: 0,
              });
            }
          },
        },
      });

      items.forEach((item, i) => {
        mHistoryTL.to(
          ".history-track",
          {
            y: -i * (item.offsetHeight + 120),
            duration: 1,
            ease: "power1.inOut",
            onStart: () => {
              items.forEach((it, idx) =>
                it.classList.toggle("active", idx === i),
              );
              visuals.forEach((v, idx) =>
                v.classList.toggle("active", idx === i),
              );
              const progress = ((i + 1) / items.length) * 100;
              document.documentElement.style.setProperty(
                "--m-progress",
                progress + "%",
              );
            },
          },
          i > 0 ? ">" : 0,
        );
      });

      mHistoryTL
        .to(".history-wrapper", { autoAlpha: 0, duration: 0.5 })
        .to(".info-history-horizontal", {
          onStart: () => $(".info-history-horizontal").addClass("show-fog"),
          onReverseComplete: () =>
            $(".info-history-horizontal").removeClass("show-fog"),
          duration: 0.1,
        })
        .set([zoomBg, zoomContent], { visibility: "visible" 
        })
        .to(zoomBg, {
          opacity: 1,
          scale: 1,
          duration: 1.5,
          ease: "power2.inOut",
        })
        .to(
          zoomContent,
          {
            opacity: 1,
            duration: 1,
            onStart: () => {
              const countNum = document.querySelector(".count-num");
              if (countNum) {
                gsap.fromTo(
                  countNum,
                  { innerText: 0 },
                  {
                    innerText: 65,
                    duration: 1.5,
                    snap: { innerText: 1 },
                    ease: "power2.out",
                  },
                );
              }
            },
          },
          "-=0.5",
        )
        .to(".section03", {
          marginTop: 0,
          duration: 1.5,
          ease: "power2.inOut",
        });
    },
  });

  // swiper
  let newsSwiper = null;

  function initNewsSwiper() {
    if (newsSwiper !== null) return;
    newsSwiper = new Swiper(".news-swiper", {
      slidesPerView: 3,
      spaceBetween: 30,
      loop: true,
      observer: true,
      observeParents: true,
      autoplay: {
        delay: 6000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        320: { slidesPerView: 1.2, spaceBetween: 20 },
        768: { slidesPerView: 2, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 30 },
      },
    });
  }

  const newsTL = gsap.timeline({
    scrollTrigger: {
      trigger: ".section03",
      start: "top 20%",
      toggleActions: "play none none none",
    },
  });

  newsTL
    .from(".news-visual-wrap", {
      y: 50,
      opacity: 0,
      duration: 1.5,
      ease: "power3.out",
      onStart: () => initNewsSwiper(),
    })
    .from(
      ".sub-box",
      { y: 30, opacity: 0, duration: 1.2, stagger: 0.4, ease: "power2.out" },
      "-=1",
    );

  // section04
  ScrollTrigger.matchMedia({
    "(min-width: 769px)": function () {
      ScrollTrigger.create({
        trigger: ".section04",
        start: "top 80%", 
        onEnter: () => {
          gsap.to(".section03", { duration: 1.5, ease: "power2.inOut" });

          $(".value-banner.split").each(function (i, el) {
            gsap.to(el, {
              opacity: 1,
              x: 0,
              duration: 1.8,
              delay: 0.3 + i * 0.4,
              ease: "power4.out",
            });
          });
        },
        onLeaveBack: () => {
          gsap.to(".section03", {
            opacity: 1,
            duration: 1,
            ease: "power2.inOut",
          });
        },
      });
    },

    //section04 - mobile
    "(max-width: 768px)": function () {
      ScrollTrigger.create({
        trigger: ".section04",
        start: "top 90%", 
        onEnter: () => {
          gsap.to(".section03", { duration: 1.5, ease: "power2.inOut" });

          $(".value-banner.split").each(function (i, el) {
            gsap.to(el, {
              opacity: 1,
              y: 0, 
              duration: 1.5,
              delay: 0.2 + i * 0.3,
              ease: "power3.out",
            });
          });
        },
        onLeaveBack: () => {
          gsap.to(".section03", {
            opacity: 1,
            duration: 1,
            ease: "power2.inOut",
          });
        },
      });
     
      gsap.from(".content_box", {
        scrollTrigger: {
          trigger: ".section05",
          start: "top 85%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        x: 50, 
        stagger: 0.2,
        duration: 1,
        ease: "power2.out",
      });
    },
  });
});
