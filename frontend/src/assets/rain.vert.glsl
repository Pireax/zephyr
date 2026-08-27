attribute float aSpeed;

uniform float uTime;
uniform float uSize;
uniform float uOverallSpeed;
uniform float uHeight;

void main() {
  vec3 local = position;
  float wrappedY = mod(local.y - uTime * uOverallSpeed * aSpeed, uHeight);
  vec3 worldPos = vec3(
    local.x,
    wrappedY - 3.0,
    local.z
  );

  vec4 mvPosition = modelViewMatrix * vec4(worldPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uSize * 38.0 / max(1.0, -mvPosition.z);
}
