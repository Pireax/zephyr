attribute float aSpeed;

uniform float uTime;
uniform float uSize;
uniform float uOverallSpeed;
uniform float uHeight;
uniform vec3 uPosition;
uniform vec2 windDirection;

varying float vAngle;

#include <snoise>

void main() {
  vec3 local = position;
  
  float fallSpeed = uOverallSpeed * aSpeed;
  float wrappedY = mod(local.y - uTime * fallSpeed, uHeight);

  float windStrength = 0.5;
  vec3 n = snoiseD(windDirection * uTime - uPosition.xz / 50.0);
  float windNoise = 1.0 - n.x;
  vec2 windDerivative = n.yz;
  vec2 windOffset = windDirection * windNoise * windStrength;

  vec3 worldPos = vec3(
    local.x + windOffset.x,
    wrappedY - 3.0,
    local.z + windOffset.y
  );

  float lateralSpeed = dot(windDerivative, windDirection) * windStrength;
  vAngle = atan(lateralSpeed, fallSpeed);

  vec4 mvPosition = modelViewMatrix * vec4(worldPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uSize * 38.0 / max(1.0, -mvPosition.z);
}
