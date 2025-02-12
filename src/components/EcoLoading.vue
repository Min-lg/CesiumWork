<template>
    <div class="eco-loading">
        <div class="loading-container">
            <div class="earth-wrapper">
                <!-- 地球主体 -->
                <div class="earth">
                    <!-- 经纬线 -->
                    <div class="meridians">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div class="parallels">
                        <span></span>
                        <span></span>
                    </div>
                </div>
                <!-- 轨道环 -->
                <div class="orbit-ring">
                    <div class="satellite"></div>
                </div>
                <!-- 外发光环 -->
                <div class="glow-ring"></div>
            </div>
            <!-- 底部指示器 -->
            <div class="indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <p class="loading-text">生态环境数据加载中...</p>
        </div>
    </div>
</template>

<style scoped>
.eco-loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(14, 36, 57, 0.95);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
}

.earth-wrapper {
    position: relative;
    width: 120px;
    height: 120px;
}

.earth {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(45deg, #1a4f95, #43a047);
    box-shadow: inset -10px -10px 30px rgba(0, 0, 0, 0.5),
        0 0 30px rgba(76, 175, 80, 0.3);
    animation: pulse 3s ease-in-out infinite;
    overflow: hidden;
}

.meridians span,
.parallels span {
    position: absolute;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    pointer-events: none;
}

.meridians {
    position: absolute;
    width: 100%;
    height: 100%;
    animation: rotateMeridians 20s linear infinite;
}

.meridians span {
    width: 100%;
    height: 100%;
    position: absolute;
    border-radius: 50%;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    border-top: none;
    border-bottom: none;
}

.meridians span:nth-child(1) {
    transform: rotate(0deg);
}

.meridians span:nth-child(2) {
    transform: rotate(45deg);
}

.meridians span:nth-child(3) {
    transform: rotate(-45deg);
}

.parallels span {
    left: 50%;
    transform: translateX(-50%);
    border: none;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
}

.parallels span:nth-child(1) {
    width: 80%;
    top: 35%;
}

.parallels span:nth-child(2) {
    width: 60%;
    top: 65%;
}

.orbit-ring {
    position: absolute;
    top: -15px;
    left: -15px;
    width: calc(100% + 30px);
    height: calc(100% + 30px);
    border: 2px dashed rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    animation: rotateOrbit 12s linear infinite;
}

.satellite {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 8px;
    height: 8px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 20px #fff;
}

.glow-ring {
    position: absolute;
    top: -5px;
    left: -5px;
    width: calc(100% + 10px);
    height: calc(100% + 10px);
    border-radius: 50%;
    border: 2px solid rgba(76, 175, 80, 0.3);
    animation: glowPulse 3s ease-in-out infinite;
}

.indicator {
    display: flex;
    gap: 8px;
}

.indicator span {
    width: 10px;
    height: 10px;
    background: #4CAF50;
    border-radius: 50%;
    animation: fade 1.5s ease-in-out infinite;
}

.indicator span:nth-child(2) {
    animation-delay: 0.2s;
}

.indicator span:nth-child(3) {
    animation-delay: 0.4s;
}

.loading-text {
    color: #fff;
    font-size: 16px;
    letter-spacing: 1px;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }
}

@keyframes rotateMeridians {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@keyframes rotateOrbit {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@keyframes glowPulse {

    0%,
    100% {
        transform: scale(1);
        opacity: 0.3;
    }

    50% {
        transform: scale(1.1);
        opacity: 0.6;
    }
}

@keyframes fade {

    0%,
    100% {
        opacity: 0.3;
        transform: scale(0.8);
    }

    50% {
        opacity: 1;
        transform: scale(1);
    }
}
</style>