uniform sampler2D uTexture;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uUvSquash;
varying float vAngle;

void main() {
  vec2 centeredUv = gl_PointCoord - 0.5;
  float sine = sin(vAngle);
  float cosine = cos(vAngle);
  vec2 uv = vec2(
    centeredUv.x * cosine - centeredUv.y * sine,
    centeredUv.x * sine + centeredUv.y * cosine
  ) + 0.5;
  uv.x = 0.5 + (uv.x - 0.5) * uUvSquash;

  vec4 tex = texture2D(uTexture, uv);

  gl_FragColor = vec4(uColor, tex.a * uOpacity);
}
