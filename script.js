// script.js
let video = document.getElementById('video');
let alertDiv = document.getElementById('alert');
let isAnalyzing = false;

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
}

async function loadModel() {
    const model = await blazepose.load();
    return model;
}

async function analyzePose(model) {
    const ctx = video.getContext('2d');
    isAnalyzing = true;
    while (isAnalyzing) {
        const poses = await model.estimatePoses(video);
        if (poses && poses.length > 0) {
            const leftElbow = poses[0].keypoints.find(k => k.name === 'left_elbow');
            const leftShoulder = poses[0].keypoints.find(k => k.name === 'left_shoulder');
            if (leftElbow && leftShoulder && leftElbow.y > leftShoulder.y + 50) {
                alertDiv.innerText = "Elbow dropped! Correct your form.";
                playAlertSound();
            } else {
                alertDiv.innerText = "";
            }
        }
    }
}

function playAlertSound() {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, context.currentTime);
    oscillator.connect(context.destination);
    oscillator.start();
    setTimeout(() => oscillator.stop(), 500);
}

document.getElementById('startButton').addEventListener('click', async () => {
    const model = await loadModel();
    analyzePose(model);
});

document.getElementById('stopButton').addEventListener('click', () => {
    isAnalyzing = false;
});
    
setupCamera();