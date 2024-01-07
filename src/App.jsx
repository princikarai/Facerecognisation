// App.jsx

import React, { useRef, useEffect } from 'react';
import './App.css';
import * as faceapi from 'face-api.js';

const App = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoInput = document.getElementById('videoInput');
    const uploadButton = document.getElementById('uploadButton');
    const uploadedVideo = document.getElementById('uploadedVideo');

    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    ]).then(start);

    function start() {
      uploadButton.addEventListener('click', () => {
        videoInput.click();
      });

      videoInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          const videoURL = URL.createObjectURL(file);
          uploadedVideo.src = videoURL;
          console.log('Video uploaded');
        }
      });

      uploadedVideo.addEventListener('play', async () => {
        console.log('Playing');
        const canvas = faceapi.createCanvasFromMedia(uploadedVideo);
        document.body.append(canvas);
        const displaySize = { height: uploadedVideo.height, width: uploadedVideo.width };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
          const detections = await faceapi.detectAllFaces(uploadedVideo, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          console.log(detections);
        }, 100);
      });

      document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
          if (uploadedVideo.paused) {
            uploadedVideo.play();
          } else {
            uploadedVideo.pause();
          }
        }
      });

      let isVideoPaused = false;

      document.addEventListener('mousedown', () => {
        if (isVideoPaused) {
          uploadedVideo.play();
        } else {
          uploadedVideo.pause();
        }

        isVideoPaused = !isVideoPaused;
      });
    }
  }, []); // Only run this effect once when the component mounts

  return (
    <div className="container">
      <input type="file" id="videoInput" accept="video/*" />
      <label htmlFor="videoInput" id="uploadButton">
        Upload Video
      </label>
  
      <video id="uploadedVideo" width="720" height="550" controls ref={videoRef}></video>
    </div>
  );
};

export default App;
