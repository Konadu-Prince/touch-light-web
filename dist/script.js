const slider = document.getElementById("lightSlider");
const label = document.getElementById("intensityLabel");
const display = document.getElementById("lightDisplay");

slider.addEventListener("input", () => {
  const intensity = slider.value;
  label.textContent = `Light Intensity: ${intensity}`;
  
  // Change the light display color based on intensity
  display.style.backgroundColor = `rgb(${intensity}, ${intensity}, ${intensity})`;
});
