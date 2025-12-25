// ==================== 전역 변수 ====================
let swiper = null;
let currentSlideIndex = 0;
let clickListenerAdded = false;

// ==================== 초기화 ====================
document.addEventListener('DOMContentLoaded', function() {
    // AOS 초기화 (스크롤 애니메이션)
    AOS.init({
        duration: 800,
        easing: 'ease-out',
        once: false,
        mirror: true
    });
    
    // 인트로 화면에 데이터 적용
    updateIntroScreen();
    
    // 인트로 화면에 마우스 반응 이미지 추가
    createIntroFloatingImages();
    
    // 슬라이드 생성
    generateSlides();
    
    // Swiper 초기화 (아직 보이지 않음)
    initializeSwiper();
});

// ==================== 인트로 화면 업데이트 ====================
function updateIntroScreen() {
    const introTitle = document.querySelector('.intro-title');
    const introSubtitle = document.querySelector('.intro-subtitle');
    const introDescription = document.querySelector('.intro-description');
    
    if (introTitle) introTitle.textContent = config.introTitle;
    if (introSubtitle) introSubtitle.textContent = config.introSubtitle;
    if (introDescription) introDescription.textContent = config.introDescription;
}

// ==================== 인트로 화면 마우스 반응 이미지 ====================
function createIntroFloatingImages() {
    const container = document.getElementById('introFloatingImages');
    if (!container) return;
    
    // 모든 월의 이미지 수집
    const allImages = [];
    teamYearData.forEach(data => {
        if (data.images && data.images.length > 0) {
            allImages.push(...data.images);
        }
    });
    
    // 8-12개의 이미지만 선택
    const selectedImages = allImages.slice(0, Math.min(12, allImages.length));
    
    selectedImages.forEach((imageUrl, index) => {
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'intro-floating-image';
        
        // 다양한 깊이 설정 (0.2 ~ 1.0)
        const depthLevels = [0.3, 0.5, 0.7, 0.9, 1.0];
        const depth = depthLevels[index % depthLevels.length];
        imageWrapper.setAttribute('data-depth', depth);
        
        // 랜덤 속도 (0.8 ~ 1.2)
        const speed = 0.8 + Math.random() * 0.4;
        imageWrapper.setAttribute('data-speed', speed);
        
        // 초기 회전값 저장
        const initialRotation = (Math.random() - 0.5) * 25;
        imageWrapper.setAttribute('data-rotation', initialRotation);
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `성과 이미지 ${index + 1}`;
        img.loading = 'lazy';
        
        // 랜덤 위치
        const positions = [
            { top: '10%', left: '10%' },
            { top: '15%', right: '15%' },
            { top: '60%', left: '8%' },
            { top: '70%', right: '12%' },
            { top: '25%', left: '25%' },
            { top: '50%', right: '25%' },
            { top: '40%', left: '50%' },
            { top: '80%', left: '30%' },
            { top: '20%', right: '30%' },
            { top: '65%', right: '40%' },
            { top: '35%', left: '70%' },
            { top: '75%', right: '20%' }
        ];
        
        const position = positions[index % positions.length];
        Object.assign(imageWrapper.style, position);
        
        // 랜덤 크기 (더 다양하게)
        const size = 120 + Math.random() * 150; // 120-270px
        imageWrapper.style.width = size + 'px';
        imageWrapper.style.height = size + 'px';
        
        imageWrapper.appendChild(img);
        container.appendChild(imageWrapper);
    });
    
    // 마우스 움직임 이벤트 (더 민감하게)
    let mouseX = 0, mouseY = 0;
    let currentMouseX = 0, currentMouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    
    // 애니메이션 루프 (부드러운 이징 + 3D 효과)
    function animateFloatingImages() {
        const images = document.querySelectorAll('.intro-floating-image');
        
        // 부드러운 이징 (0.08 = 느리게, 0.15 = 빠르게)
        currentMouseX += (mouseX - currentMouseX) * 0.08;
        currentMouseY += (mouseY - currentMouseY) * 0.08;
        
        images.forEach((image, index) => {
            const depth = parseFloat(image.getAttribute('data-depth'));
            const speed = parseFloat(image.getAttribute('data-speed'));
            const initialRotation = parseFloat(image.getAttribute('data-rotation'));
            
            // 움직임 범위 확대 (50 → 120)
            const moveX = currentMouseX * depth * 120 * speed;
            const moveY = currentMouseY * depth * 120 * speed;
            
            // 동적 회전 (마우스 위치에 따라)
            const rotateZ = initialRotation + (currentMouseX * depth * 15);
            const rotateX = currentMouseY * depth * 10; // 3D 회전
            const rotateY = currentMouseX * depth * 10; // 3D 회전
            
            // 동적 스케일 (마우스에 가까울수록 커짐)
            const distance = Math.sqrt(currentMouseX * currentMouseX + currentMouseY * currentMouseY);
            const scale = 1 + (distance * depth * 0.1);
            
            // 3D transform 적용
            image.style.transform = `
                translate(${moveX}px, ${moveY}px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                rotateZ(${rotateZ}deg) 
                scale(${scale})
            `;
            
            // 마우스 위치에 따른 투명도 변화 (선택적)
            const opacity = 0.6 + (depth * 0.4);
            image.style.opacity = opacity;
        });
        
        requestAnimationFrame(animateFloatingImages);
    }
    
    animateFloatingImages();
}

// ==================== 슬라이드 동적 생성 ====================
function generateSlides() {
    const slidesContainer = document.getElementById('slidesContainer');
    const totalSlides = document.getElementById('totalSlides');
    
    if (!slidesContainer) return;
    
    // 총 슬라이드 수 업데이트
    if (totalSlides) {
        totalSlides.textContent = teamYearData.length;
    }
    
    // 각 데이터 항목에 대해 슬라이드 생성
    teamYearData.forEach((data, index) => {
        const slide = createSlide(data, index);
        slidesContainer.appendChild(slide);
    });
}

// ==================== 개별 슬라이드 생성 ====================
function createSlide(data, index) {
    const slide = document.createElement('div');
    slide.className = `swiper-slide slide-bg-${(index % 12) + 1}`;
    
    // 피처 리스트 HTML 생성
    let featuresHTML = '';
    if (data.features && data.features.length > 0) {
        featuresHTML = `
            <div class="slide-feature-list">
                ${data.features.map(feature => `
                    <div class="feature-item">
                        <h4>${feature.title}</h4>
                        <p>${feature.content}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // 동영상 HTML 생성
    let videoHTML = '';
    if (data.video) {
        videoHTML = `
            <div class="slide-media slide-video" data-position="${getMediaPosition(index, 0, 'video')}">
                <video autoplay loop muted playsinline>
                    <source src="${data.video}" type="video/mp4">
                </video>
            </div>
        `;
    }
    
    // 이미지 HTML 생성
    let imagesHTML = '';
    if (data.images && data.images.length > 0) {
        imagesHTML = data.images.map((imageUrl, imgIndex) => `
            <div class="slide-media slide-image" data-position="${getMediaPosition(index, imgIndex, 'image')}">
                <img src="${imageUrl}" alt="${data.title} - 이미지 ${imgIndex + 1}" loading="lazy">
            </div>
        `).join('');
    }
    
    slide.innerHTML = `
        ${videoHTML}
        ${imagesHTML}
        <div class="slide-content">
            <div class="slide-month">${data.month}</div>
            ${data.icon ? `<div class="slide-icon">${data.icon}</div>` : ''}
            <h2 class="slide-title">${data.title}</h2>
            ${data.stat ? `<div class="slide-stat" data-count="${extractNumber(data.stat)}">${data.stat}</div>` : ''}
            <p class="slide-description">${data.description}</p>
            ${featuresHTML}
        </div>
    `;
    
    return slide;
}

// ==================== 미디어 위치 계산 (슬라이드마다 다르게) ====================
function getMediaPosition(slideIndex, mediaIndex, type) {
    // 슬라이드와 미디어 인덱스를 기반으로 다양한 위치 반환
    const positions = [
        'top-left', 'top-right', 'bottom-left', 'bottom-right',
        'left-center', 'right-center', 'top-center', 'bottom-center'
    ];
    
    // 슬라이드마다 다른 위치 패턴
    const positionIndex = (slideIndex * 3 + mediaIndex) % positions.length;
    return positions[positionIndex];
}

// ==================== 숫자 추출 (카운트업용) ====================
function extractNumber(text) {
    const match = text.match(/[\d,.]+/);
    return match ? match[0].replace(/,/g, '') : '0';
}

// ==================== Swiper 초기화 ====================
function initializeSwiper() {
    const swiperConfig = {
        direction: 'vertical',
        mousewheel: {
            releaseOnEdges: true,
            sensitivity: 1
        },
        keyboard: {
            enabled: true,
            onlyInViewport: true
        },
        speed: 800,
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            renderBullet: function (index, className) {
                return '<span class="' + className + '"></span>';
            },
        },
        on: {
            slideChange: function() {
                updateSlideCounter(this.activeIndex);
                updateProgressBar(this.activeIndex);
                animateStats(this.activeIndex);
                checkIfLastSlide(this.activeIndex);
            },
            reachEnd: function() {
                // 마지막 슬라이드 도달 - 자동으로 넘어가지 않고 사용자 클릭 대기
                checkIfLastSlide(teamYearData.length - 1);
            }
        }
    };
    
    // 자동재생 설정이 있으면 추가
    if (config.autoplayDelay) {
        swiperConfig.autoplay = {
            delay: config.autoplayDelay,
            disableOnInteraction: true
        };
    }
    
    swiper = new Swiper('.swiper-container', swiperConfig);
}

// ==================== 리뷰 시작 ====================
function startReview() {
    const introScreen = document.getElementById('introScreen');
    const mainSwiper = document.getElementById('mainSwiper');
    const slideCounter = document.getElementById('slideCounter');
    
    // 인트로 숨기기
    introScreen.classList.add('hidden');
    
    // 메인 슬라이드 표시
    setTimeout(() => {
        mainSwiper.style.display = 'block';
        slideCounter.style.display = 'block';
        
        // Swiper 업데이트
        if (swiper) {
            swiper.slideTo(0, 0);  // 첫 슬라이드로 확실히 이동
            swiper.update();
            updateProgressBar(0);
            updateSlideCounter(0);
            animateStats(0);
        }
        
        // 기존 떠다니는 아이콘 제거 (중복 방지)
        const floatingContainer = document.getElementById('floatingContainer');
        if (floatingContainer) {
            floatingContainer.innerHTML = '';
        }
        
        // 떠다니는 아이콘 생성
        createFloatingIcons();
        
        // 클릭 이벤트 리스너 등록 (중복 방지는 이미 처리됨)
        enableClickToNext();
    }, 500);
}

// ==================== 슬라이드 카운터 업데이트 ====================
function updateSlideCounter(index) {
    const currentSlide = document.getElementById('currentSlide');
    if (currentSlide) {
        currentSlide.textContent = index + 1;
    }
    currentSlideIndex = index;
}

// ==================== 진행률 바 업데이트 ====================
function updateProgressBar(index) {
    const progressBar = document.getElementById('progressBar');
    const totalSlides = teamYearData.length;
    const progress = ((index + 1) / totalSlides) * 100;
    
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
}

// ==================== 통계 숫자 애니메이션 ====================
function animateStats(slideIndex) {
    if (!config.useCountUp || typeof countUp === 'undefined') return;
    
    const slides = document.querySelectorAll('.swiper-slide');
    const currentSlide = slides[slideIndex];
    
    if (!currentSlide) return;
    
    const statElement = currentSlide.querySelector('.slide-stat');
    
    if (statElement) {
        const targetNumber = parseFloat(extractNumber(statElement.textContent));
        const originalText = statElement.textContent;
        const suffix = originalText.replace(/[\d,.\s]/g, '');
        
        if (!isNaN(targetNumber) && targetNumber > 0) {
            const options = {
                duration: 2,
                separator: ',',
                decimal: '.',
                suffix: suffix ? ' ' + suffix : ''
            };
            
            const countUpAnim = new countUp.CountUp(statElement, targetNumber, options);
            
            if (!countUpAnim.error) {
                countUpAnim.start();
            } else {
                console.error(countUpAnim.error);
            }
        }
    }
}

// ==================== 마지막 슬라이드 체크 ====================
function checkIfLastSlide(index) {
    const isLast = index === teamYearData.length - 1;
    const finishHint = document.getElementById('finishHint');
    
    if (isLast) {
        // 마지막 슬라이드에서 완료 힌트 표시
        if (finishHint) {
            finishHint.classList.add('visible');
        }
    } else {
        // 다른 슬라이드에서는 힌트 숨김
        if (finishHint) {
            finishHint.classList.remove('visible');
        }
    }
}

// ==================== 엔딩 화면 표시 ====================
function showEndingScreen() {
    const endingScreen = document.getElementById('endingScreen');
    const mainSwiper = document.getElementById('mainSwiper');
    const slideCounter = document.getElementById('slideCounter');
    
    if (endingScreen) {
        endingScreen.classList.add('visible');
        endingScreen.style.display = 'flex';
        
        // AOS 다시 초기화
        AOS.refresh();
    }
    
    // 메인 슬라이더 숨기기
    if (mainSwiper) mainSwiper.style.display = 'none';
    if (slideCounter) slideCounter.style.display = 'none';
}

// ==================== 다시 보기 ====================
function restartReview() {
    const endingScreen = document.getElementById('endingScreen');
    const introScreen = document.getElementById('introScreen');
    const mainSwiper = document.getElementById('mainSwiper');
    const slideCounter = document.getElementById('slideCounter');
    const finishHint = document.getElementById('finishHint');
    
    // 엔딩 화면 숨기기
    if (endingScreen) {
        endingScreen.classList.remove('visible');
        setTimeout(() => {
            endingScreen.style.display = 'none';
        }, 500);
    }
    
    // 메인 스와이퍼 숨기기
    if (mainSwiper) {
        mainSwiper.style.display = 'none';
    }
    
    // 슬라이드 카운터 숨기기
    if (slideCounter) {
        slideCounter.style.display = 'none';
    }
    
    // 완료 힌트 숨기기
    if (finishHint) {
        finishHint.classList.remove('visible');
    }
    
    // 인트로 화면 다시 표시
    if (introScreen) {
        introScreen.classList.remove('hidden');
    }
    
    // Swiper 완전 리셋
    if (swiper) {
        swiper.slideTo(0, 0);
        swiper.update();
    }
    
    // 진행률 바 리셋
    updateProgressBar(0);
    
    // 슬라이드 카운터 리셋
    updateSlideCounter(0);
}

// ==================== 공유하기 ====================
function shareReview() {
    const shareData = {
        title: `${config.teamName} ${config.year}년 결산`,
        text: `${config.teamName}의 ${config.year}년 성과를 확인해보세요!`,
        url: config.shareUrl
    };
    
    // Web Share API 지원 확인
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('공유 성공'))
            .catch((error) => console.log('공유 취소:', error));
    } else {
        // 대체: URL 복사
        copyToClipboard(config.shareUrl);
        alert('링크가 클립보드에 복사되었습니다!');
    }
}

// ==================== 클립보드 복사 ====================
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
    } else {
        // 대체 방법
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('복사 실패:', err);
        }
        
        document.body.removeChild(textArea);
    }
}

// ==================== 키보드 단축키 ====================
document.addEventListener('keydown', function(e) {
    // ESC 키: 처음으로
    if (e.key === 'Escape') {
        restartReview();
    }
    
    // Space 키: 다음 슬라이드
    if (e.key === ' ' && swiper) {
        e.preventDefault();
        swiper.slideNext();
    }
});

// ==================== 터치 제스처 지원 ====================
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
}, false);

document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, false);

function handleSwipe() {
    if (!swiper) return;
    
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // 위로 스와이프 - 다음 슬라이드
            swiper.slideNext();
        } else {
            // 아래로 스와이프 - 이전 슬라이드
            swiper.slidePrev();
        }
    }
}

// ==================== 반응형 대응 ====================
window.addEventListener('resize', function() {
    if (swiper) {
        swiper.update();
    }
});

// ==================== 화면 클릭으로 다음 슬라이드 ====================
function enableClickToNext() {
    // 이미 리스너가 추가되었으면 스킵 (중복 방지)
    if (clickListenerAdded) return;
    
    const swiperContainer = document.querySelector('.swiper-container');
    
    if (swiperContainer) {
        swiperContainer.addEventListener('click', function(e) {
            // 버튼이나 페이지네이션 클릭은 제외
            if (e.target.closest('.swiper-button-next') || 
                e.target.closest('.swiper-button-prev') || 
                e.target.closest('.swiper-pagination')) {
                return;
            }
            
            if (swiper) {
                // 마지막 슬라이드인지 확인
                const isLastSlide = swiper.activeIndex === teamYearData.length - 1;
                
                if (isLastSlide) {
                    // 마지막 슬라이드에서 클릭하면 엔딩 화면으로
                    showEndingScreen();
                } else {
                    // 다음 슬라이드로 이동
                    swiper.slideNext();
                }
            }
        });
        
        clickListenerAdded = true;
    }
}

// ==================== 떠다니는 아이콘 생성 ====================
function createFloatingIcons() {
    const floatingContainer = document.getElementById('floatingContainer');
    if (!floatingContainer) return;
    
    // 떠다닐 아이콘들 (data.js의 아이콘 사용)
    const icons = teamYearData.map(item => item.icon).filter(icon => icon);
    
    // 15개의 떠다니는 아이콘 생성
    const numberOfIcons = 15;
    
    for (let i = 0; i < numberOfIcons; i++) {
        const icon = icons[i % icons.length];
        const floatingIcon = document.createElement('div');
        floatingIcon.className = 'floating-icon';
        floatingIcon.textContent = icon;
        
        // 랜덤 위치
        floatingIcon.style.left = Math.random() * 100 + '%';
        floatingIcon.style.top = Math.random() * 100 + '%';
        
        // 랜덤 애니메이션 지연
        floatingIcon.style.animationDelay = Math.random() * 5 + 's';
        
        // 랜덤 애니메이션 지속 시간 (10-25초)
        floatingIcon.style.animationDuration = (Math.random() * 15 + 10) + 's';
        
        // 랜덤 크기
        const size = Math.random() * 40 + 30; // 30-70px
        floatingIcon.style.fontSize = size + 'px';
        
        // 랜덤 투명도
        floatingIcon.style.opacity = Math.random() * 0.3 + 0.1; // 0.1-0.4
        
        floatingContainer.appendChild(floatingIcon);
    }
}

// ==================== 개발자 도구 ====================
// 콘솔에서 특정 슬라이드로 이동: goToSlide(숫자)
window.goToSlide = function(index) {
    if (swiper && index >= 0 && index < teamYearData.length) {
        swiper.slideTo(index);
    }
};

// 콘솔에서 데이터 확인: showData()
window.showData = function() {
    console.table(teamYearData);
};

console.log('%c🎉 팀 결산 페이지가 로드되었습니다!', 'color: #0078d4; font-size: 16px; font-weight: bold;');
console.log('%c💡 팁: data.js 파일을 수정하여 내용을 변경할 수 있습니다.', 'color: #50e6ff; font-size: 12px;');
console.log('%c⌨️  단축키: Space(다음), ESC(처음으로), 화면클릭(다음)', 'color: #00cc6a; font-size: 12px;');

