// Tuner functionality

const setTunerToPowerOff = () => {
    const animationEl = dom.powerOnAnimation;
    dom.tunerContent.style.opacity = 0;
    animationEl.innerHTML = `<span class="text-lg font-bold text-[var(--text-color)]">Power OFF</span>`;
    animationEl.style.opacity = 1;
};

const runPowerOnAnimation = async (station, callback) => {
    const animationEl = dom.powerOnAnimation;
    animationEl.innerHTML = `
        <div class="w-full flex justify-around items-center text-[var(--text-muted-color)]">
            <div class="startup-item" style="animation-delay: 0s;">
                <span class="font-bold text-sm">Glz Radio</span>
            </div>
            <div class="flex items-center space-x-4">
                <div class="startup-item" style="animation-delay: 0.2s;">
                    <span id="band-icon-am" class="font-mono font-bold text-lg band-icon">AM</span>
                </div>
                <div class="startup-item" style="animation-delay: 0.4s;">
                    <span id="band-icon-fm" class="font-mono font-bold text-lg band-icon">FM</span>
                </div>
                <div class="startup-item" style="animation-delay: 0.6s;">
                    <i id="band-icon-web" data-lucide="satellite-dish" class="band-icon"></i>
                </div>
            </div>
        </div>
    `;
    
    lucide.createIcons({ parent: animationEl });
    animationEl.style.opacity = 1;
    
    let band = 'web';
    if (station.frequency.includes('AM')) band = 'am';
    else if (station.frequency.includes('FM')) band = 'fm';
    
    await delay(800);
    
    const iconToGlow = animationEl.querySelector(`#band-icon-${band}`);
    if(iconToGlow) {
        iconToGlow.classList.add('band-icon-glow');
    }
    
    await delay(1200);
    animationEl.style.opacity = 0;
    await delay(400);
    
    if (callback) callback();
};

const updateTunerDisplay = (station, isPowerOn = false) => {
    if (!station || !state.isPlaying) {
        setTunerToPowerOff();
        return;
    }
    
    const showTuner = () => {
        dom.tunerContent.style.opacity = 1;
        dom.amTuner.classList.add('hidden');
        dom.fmTuner.classList.add('hidden');
        dom.webTuner.classList.add('hidden');
        dom.tunerBandIndicator.textContent = '';
        
        const freqString = station.frequency;
        let targetNeedlePos = -10;
        
        if (freqString.includes('AM')) {
            dom.amTuner.classList.remove('hidden');
            dom.tunerBandIndicator.textContent = 'AM';
            const freq = parseFloat(freqString.match(/(\d+)/)[0]);
            targetNeedlePos = 5 + ((freq - 530) / (1600 - 530)) * 90;
        } else if (freqString.includes('FM')) {
            dom.fmTuner.classList.remove('hidden');
            dom.tunerBandIndicator.textContent = 'FM';
            const freq = parseFloat(freqString.match(/(\d+\.\d+)/)[0]);
            targetNeedlePos = 5 + ((freq - 88) / (108 - 88)) * 90;
        } else {
            dom.webTuner.classList.remove('hidden');
            dom.tunerBandIndicator.textContent = 'SAT';
            lucide.createIcons();
        }
        
        const needle = dom.tunerNeedle;
        needle.classList.remove('needle-settle');
        
        if (state.isPlaying && targetNeedlePos > -10) {
            needle.style.left = `${targetNeedlePos}%`;
            setTimeout(() => needle.classList.add('needle-settle'), 50);
        } else {
            needle.style.left = `-10px`;
        }
    };
    
    if (isPowerOn) {
        runPowerOnAnimation(station, showTuner);
    } else {
        dom.tunerContent.style.opacity = 1;
        showTuner();
    }
};

// Export functions
window.tuner = {
    setTunerToPowerOff,
    runPowerOnAnimation,
    updateTunerDisplay
};
