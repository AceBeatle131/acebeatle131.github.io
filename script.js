// 错误边界处理
class ErrorBoundary {
    static handleComponentError(error, info) {
        console.error('Error caught by ErrorBoundary:', error, info);
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-boundary';
        errorContainer.innerHTML = `
            <h3>出错了</h3>
            <p>${error.message}</p>
            <p>请刷新页面或稍后再试</p>
        `;
        document.querySelector('.container').prepend(errorContainer);
    }
}

// 更新时间显示
function updateTime() {
    try {
        const now = new Date();
        
        // 更新时间
        const timeElement = document.getElementById('current-time');
        timeElement.textContent = now.toLocaleTimeString('zh-CN', { hour12: false });
        
        // 更新日期
        const dateElement = document.getElementById('current-date');
        dateElement.textContent = now.toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        });
    } catch (error) {
        ErrorBoundary.handleComponentError(error, 'updateTime function');
    }
}

// 初始化时间并设置定时器
function initTimeDisplay() {
    updateTime();
    setInterval(updateTime, 1000);
}

// 滚动进度条
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.prepend(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = `${progress}%`;
    });
}

// 返回顶部按钮
function initBackToTopButton() {
    const backToTopButton = document.createElement('div');
    backToTopButton.className = 'back-to-top';
    backToTopButton.innerHTML = '↑';
    backToTopButton.title = '返回顶部';
    document.body.appendChild(backToTopButton);
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
}

// 在 DOMContentLoaded 事件中添加初始化
document.addEventListener('DOMContentLoaded', () => {
    try {
        initTimeDisplay();
        initScrollProgress();
        initBackToTopButton();
        
                // 图标加载超时处理
        document.querySelectorAll('.link-icon').forEach(img => {
            const originalSrc = img.src;
            const timeoutDuration = 5000; // 5秒超时
            let timeoutId;

            // 设置超时定时器
            timeoutId = setTimeout(() => {
                if (!img.complete || img.naturalWidth === 0) {
                    img.src = 'favicon.svg'; // 使用默认图标
                }
            }, timeoutDuration);

            // 图片加载完成后清除定时器
            img.onload = () => {
                clearTimeout(timeoutId);
            };

            // 图片加载错误时使用默认图标
            img.onerror = () => {
                clearTimeout(timeoutId);
                img.src = 'favicon.svg';
            };
        });
        
        // 添加分类动画
        const categories = document.querySelectorAll('.category');
        categories.forEach((category, index) => {
            setTimeout(() => {
                category.classList.add('visible');
            }, 500 + (index * 200));
        });
    } catch (error) {
        ErrorBoundary.handleComponentError(error, 'DOMContentLoaded event');
    }
});

// 搜索网站功能
function searchWebsites() {
    try {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categories = document.querySelectorAll('.category');
        
        if (!searchTerm) {
            // 如果搜索框为空，显示所有网站
            categories.forEach(category => {
                category.style.display = 'block';
                const links = category.querySelectorAll('.link-item');
                links.forEach(link => {
                    link.style.display = 'flex';
                    // 移除之前的高亮
                    const spans = link.querySelectorAll('span.highlight');
                    spans.forEach(span => {
                        span.outerHTML = span.textContent;
                    });
                });
            });
            
            // 移除无结果提示
            const existingNoResults = document.querySelector('.no-results');
            if (existingNoResults) {
                existingNoResults.remove();
            }
            
            return;
        }

        let hasResults = false;
        
        categories.forEach(category => {
            const links = category.querySelectorAll('.link-item');
            let categoryHasResults = false;
            
            links.forEach(link => {
                const linkText = link.textContent.toLowerCase();
                if (linkText.includes(searchTerm)) {
                    link.style.display = 'flex';
                    categoryHasResults = true;
                    hasResults = true;
                    
                    // 添加高亮效果
                    const text = link.textContent;
                    const regex = new RegExp(searchTerm, 'gi');
                    const highlightedText = text.replace(regex, match => 
                        `<span class="highlight">${match}</span>`
                    );
                    link.innerHTML = link.innerHTML.replace(text, highlightedText);
                } else {
                    link.style.display = 'none';
                }
            });

            // 如果分类中有匹配结果，显示整个分类，否则隐藏
            if (categoryHasResults) {
                category.style.display = 'block';
            } else {
                category.style.display = 'none';
            }
        });

        // 如果没有匹配结果，显示提示
        if (!hasResults) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = '没有找到匹配的网站';
            
            // 移除之前可能存在的提示
            const existingNoResults = document.querySelector('.no-results');
            if (existingNoResults) {
                existingNoResults.remove();
            }
            
            document.querySelector('.container').insertBefore(noResults, document.querySelector('footer'));
        } else {
            const existingNoResults = document.querySelector('.no-results');
            if (existingNoResults) {
                existingNoResults.remove();
            }
        }
    } catch (error) {
        ErrorBoundary.handleComponentError(error, 'searchWebsites function');
    }
}

// 随机推荐历史记录
let randomLinkHistory = [];
const MAX_HISTORY_LENGTH = 5;

function getRandomLink() {
    try {
        const links = Array.from(document.querySelectorAll('.links a'));
        const availableLinks = links.filter(link => !randomLinkHistory.includes(link.href));
        
        // 如果没有可用链接（所有链接都在历史记录中），重置历史记录
        const targetLinks = availableLinks.length > 0 ? availableLinks : links;
        
        const randomLink = targetLinks[Math.floor(Math.random() * targetLinks.length)];
        
        // 添加到历史记录
        randomLinkHistory.unshift(randomLink.href);
        if (randomLinkHistory.length > MAX_HISTORY_LENGTH) {
            randomLinkHistory.pop();
        }
        
        // 显示提示
        const tooltip = document.createElement('div');
        tooltip.className = 'random-tooltip';
        tooltip.textContent = `推荐: ${randomLink.textContent.trim()}`;
        document.body.appendChild(tooltip);
        
        // 动画效果
        tooltip.style.opacity = '1';
        setTimeout(() => {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                tooltip.remove();
            }, 500);
        }, 2000);
        
        // 打开链接
        window.open(randomLink.getAttribute('href'), '_blank');
    } catch (error) {
        ErrorBoundary.handleComponentError(error, 'getRandomLink function');
    }
}

// 深色模式切换功能
function toggleDarkMode() {
    try {
        const htmlElement = document.documentElement;
        const modeToggle = document.getElementById('modeToggle');
        
        // 检查当前模式
        const isDark = htmlElement.getAttribute('data-theme') === 'dark';
        
        if (isDark) {
            // 切换到浅色模式
            htmlElement.setAttribute('data-theme', 'light');
            localStorage.setItem('dark-mode', 'disabled');
            modeToggle.innerHTML = '切换深色模式';
        } else {
            // 切换到深色模式
            htmlElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('dark-mode', 'enabled');
            modeToggle.innerHTML = '切换浅色模式';
        }
    } catch (error) {
        ErrorBoundary.handleComponentError(error, 'toggleDarkMode function');
    }
}

// 根据用户偏好和 localStorage 初始化模式
function initDarkMode() {
    try {
        const htmlElement = document.documentElement;
        const modeToggle = document.getElementById('modeToggle');
        const savedMode = localStorage.getItem('dark-mode');

        // 优先使用 localStorage 的值
        if (savedMode === 'enabled') {
            htmlElement.setAttribute('data-theme', 'dark');
            modeToggle.innerHTML = '切换浅色模式';
        } else if (savedMode === 'disabled') {
            htmlElement.setAttribute('data-theme', 'light');
            modeToggle.innerHTML = '切换深色模式';
        } else {
            // 没有存储值时，跟随系统偏好
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                htmlElement.setAttribute('data-theme', 'dark');
                modeToggle.innerHTML = '切换浅色模式';
            } else {
                htmlElement.setAttribute('data-theme', 'light');
                modeToggle.innerHTML = '切换深色模式';
            }
        }
    } catch (error) {
        ErrorBoundary.handleComponentError(error, 'initDarkMode function');
    }
}

window.addEventListener('DOMContentLoaded', initDarkMode);