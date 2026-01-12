/**
 * 轮播图功能
 * 支持自动播放、手动切换、指示器点击、触摸滑动
 */

class Carousel {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.warn('Carousel container not found');
      return;
    }

    this.slidesContainer = this.container.querySelector('.carousel-slides');
    this.slides = this.container.querySelectorAll('.carousel-slide');
    this.prevBtn = this.container.querySelector('.carousel-btn-prev');
    this.nextBtn = this.container.querySelector('.carousel-btn-next');
    this.indicators = this.container.querySelectorAll('.carousel-indicator');
    
    this.currentIndex = 0;
    this.autoPlayInterval = null;
    this.autoPlayDelay = 5000; // 5秒自动切换
    
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.minSwipeDistance = 50; // 最小滑动距离
    
    this.init();
  }

  init() {
    // 绑定按钮事件
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }

    // 绑定指示器事件
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });

    // 绑定触摸事件（移动端滑动）
    if (this.slidesContainer) {
      this.slidesContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
      this.slidesContainer.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
    }

    // 鼠标悬停时暂停自动播放
    if (this.container) {
      this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
      this.container.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    // 启动自动播放
    this.startAutoPlay();

    // 页面可见性变化时控制自动播放
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAutoPlay();
      } else {
        this.startAutoPlay();
      }
    });
  }

  goToSlide(index) {
    // 移除当前active状态
    this.slides[this.currentIndex].classList.remove('active');
    this.indicators[this.currentIndex].classList.remove('active');

    // 更新索引
    this.currentIndex = index;

    // 添加新的active状态
    this.slides[this.currentIndex].classList.add('active');
    this.indicators[this.currentIndex].classList.add('active');

    // 移动轮播图
    const offset = -this.currentIndex * 100;
    this.slidesContainer.style.transform = `translateX(${offset}%)`;
  }

  next() {
    const nextIndex = (this.currentIndex + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  prev() {
    const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  }

  startAutoPlay() {
    this.pauseAutoPlay(); // 先清除现有的定时器
    this.autoPlayInterval = setInterval(() => {
      this.next();
    }, this.autoPlayDelay);
  }

  pauseAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  handleTouchStart(e) {
    this.touchStartX = e.changedTouches[0].screenX;
  }

  handleTouchEnd(e) {
    this.touchEndX = e.changedTouches[0].screenX;
    this.handleSwipe();
  }

  handleSwipe() {
    const swipeDistance = this.touchStartX - this.touchEndX;
    
    if (Math.abs(swipeDistance) > this.minSwipeDistance) {
      if (swipeDistance > 0) {
        // 向左滑动，显示下一张
        this.next();
      } else {
        // 向右滑动，显示上一张
        this.prev();
      }
    }
  }

  destroy() {
    this.pauseAutoPlay();
    // 移除事件监听器等清理工作
  }
}

// 页面加载完成后初始化轮播图
document.addEventListener('DOMContentLoaded', () => {
  const carousel = new Carousel('.carousel-container');
  
  // 将实例保存到全局，方便调试或外部控制
  window.beetradeCarousel = carousel;
});

