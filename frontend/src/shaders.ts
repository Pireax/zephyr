import * as THREE from 'three'

(THREE.ShaderChunk as any).snoise = `
  //WEBGL-NOISE FROM https://github.com/stegu/webgl-noise
  //Description : Array and textureless GLSL 2D simplex noise function. Author : Ian McEwan, Ashima Arts. Maintainer : stegu Lastmod : 20110822 (ijm) License : Copyright (C) 2011 Ashima Arts. All rights reserved. Distributed under the MIT License. See LICENSE file. https://github.com/ashima/webgl-noise https://github.com/stegu/webgl-noise      
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec3 permute(vec3 x) {
    return mod289(((x * 34.0) + 1.0) * x);
  }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  vec3 snoiseD(vec2 v) {
    const vec4 C = vec4(
         0.211324865405187,
         0.366025403784439,
        -0.577350269189626,
         0.024390243902439
    );

    // First corner
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);

    // Other corners
    vec2 i1 = (x0.x > x0.y)
        ? vec2(1.0, 0.0)
        : vec2(0.0, 1.0);

    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    // Permutations
    i = mod289(i);

    vec3 p = permute(
        permute(i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0)
    );

    // Radial attenuation before raising to fourth power
    vec3 t = max(
        0.5 - vec3(
            dot(x0,     x0),
            dot(x12.xy, x12.xy),
            dot(x12.zw, x12.zw)
        ),
        0.0
    );

    // Gradients
    vec3 x  = 2.0 * fract(p * C.www) - 1.0;
    vec3 h  = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Approximate gradient normalization.
    vec3 norm =
        1.79284291400159
        - 0.85373472095314 * (a0 * a0 + h * h);

    // Gradient vectors for the three corners.
    vec2 grad0 = vec2(a0.x, h.x);
    vec2 grad1 = vec2(a0.y, h.y);
    vec2 grad2 = vec2(a0.z, h.z);

    // g_i = gradient_i dot displacement_i
    vec3 g = vec3(
        dot(grad0, x0),
        dot(grad1, x12.xy),
        dot(grad2, x12.zw)
    );

    // t^3 and t^4
    vec3 t2 = t * t;
    vec3 t3 = t2 * t;
    vec3 t4 = t2 * t2;

    // Noise value
    float value = dot(norm * t4, g);

    // Analytical derivative:
    //
    // d/dv [ norm * t^4 * dot(grad, x) ]
    //
    // = norm * (
    //       t^4 * grad
    //       - 8 * t^3 * dot(grad,x) * x
    //   )
    //
    vec2 deriv =
        norm.x * (t4.x * grad0 - 8.0 * t3.x * g.x * x0) +
        norm.y * (t4.y * grad1 - 8.0 * t3.y * g.y * x12.xy) +
        norm.z * (t4.z * grad2 - 8.0 * t3.z * g.z * x12.zw);

    return 130.0 * vec3(value, deriv);
  }
  //END NOISE
`