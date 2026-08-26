import * as THREE from "three"
import { shaderMaterial } from "@react-three/drei"
import { extend } from "@react-three/fiber"

const GrassMaterial = shaderMaterial(
  {
    bladeHeight: 1,
    map: null,
    alphaMap: null,
    time: 0,
    windDirection: new THREE.Vector2(1, 1),
    windSpeed: 1,
    tipColor: new THREE.Color(0.0, 0.6, 0.0).convertSRGBToLinear(),
    bottomColor: new THREE.Color(0.0, 0.1, 0.0).convertSRGBToLinear(),
  },
  `   precision mediump float;
      attribute vec3 offset;
      attribute vec4 orientation;
      attribute float halfRootAngleSin;
      attribute float halfRootAngleCos;
      attribute float stretch;
      uniform float time;
      uniform float bladeHeight;
      uniform vec2 windDirection;
      uniform float windSpeed;
      varying vec2 vUv;
      varying float frc;
      
      #include <snoise>
      
      //https://www.geeks3d.com/20141201/how-to-rotate-a-vertex-by-a-quaternion-in-glsl/
      vec3 rotateVectorByQuaternion( vec3 v, vec4 q){
        return 2.0 * cross(q.xyz, v * q.w + cross(q.xyz, v)) + v;
      }
      
      //https://en.wikipedia.org/wiki/Slerp
      vec4 slerp(vec4 v0, vec4 v1, float t) {
        // Only unit quaternions are valid rotations.
        // Normalize to avoid undefined behavior.
        normalize(v0);
        normalize(v1);
      
        // Compute the cosine of the angle between the two vectors.
        float dot_ = dot(v0, v1);
      
        // If the dot product is negative, slerp won't take
        // the shorter path. Note that v1 and -v1 are equivalent when
        // the negation is applied to all four components. Fix by 
        // reversing one quaternion.
        if (dot_ < 0.0) {
          v1 = -v1;
          dot_ = -dot_;
        }  
      
        const float DOT_THRESHOLD = 0.9995;
        if (dot_ > DOT_THRESHOLD) {
          // If the inputs are too close for comfort, linearly interpolate
          // and normalize the result.
          vec4 result = t*(v1 - v0) + v0;
          normalize(result);
          return result;
        }
      
        // Since dot is in range [0, DOT_THRESHOLD], acos is safe
        float theta_0 = acos(dot_);       // theta_0 = angle between input vectors
        float theta = theta_0*t;          // theta = angle between v0 and result
        float sin_theta = sin(theta);     // compute this value only once
        float sin_theta_0 = sin(theta_0); // compute this value only once
        float s0 = cos(theta) - dot_ * sin_theta / sin_theta_0;  // == sin(theta_0 - theta) / sin(theta_0)
        float s1 = sin_theta / sin_theta_0;
        return (s0 * v0) + (s1 * v1);
      }
      
      void main() {
        //Relative position of vertex along the mesh Y direction
        frc = position.y/float(bladeHeight);
        //Get wind data from simplex noise 
        vec2 windPosition = windDirection * windSpeed * time - offset.xz / 50.0;
        float noise = 1.0-(snoise(windPosition)); 
        //Define the direction of an unbent blade of grass rotated around the Y axis
        vec4 direction = vec4(0.0, halfRootAngleSin, 0.0, halfRootAngleCos);
        //Interpolate between the unbent direction and the direction of growth calculated on the CPU. 
        //Using the relative location of the vertex along the Y axis as the weight, we get a smooth bend
        direction = slerp(direction, orientation, frc);
        vec3 vPosition = vec3(position.x, position.y + position.y * stretch, position.z);
        vPosition = rotateVectorByQuaternion(vPosition, direction);
      
       //Apply wind
       float halfAngle = noise * 0.15;
        vPosition = rotateVectorByQuaternion(vPosition, normalize(vec4(sin(halfAngle), 0.0, -sin(halfAngle), cos(halfAngle))));
        //UV for texture
        vUv = uv;
        //Calculate final position of the vertex from the world offset and the above shenanigans 
        gl_Position = projectionMatrix * modelViewMatrix * vec4(offset + vPosition, 1.0 );
      }`,
  `
      precision mediump float;
      uniform sampler2D map;
      uniform sampler2D alphaMap;
      uniform vec3 tipColor;
      uniform vec3 bottomColor;
      varying vec2 vUv;
      varying float frc;
      
      void main() {
        //Get transparency information from alpha map
        float alpha = texture2D(alphaMap, vUv).r;
        //If transparent, don't draw
        if(alpha < 0.15) discard;
        //Get colour data from texture
        vec4 col = vec4(texture2D(map, vUv));
        //Add more green towards root
        col = mix(vec4(tipColor, 1.0), col, frc);
        //Add a shadow towards root
        col = mix(vec4(bottomColor, 1.0), col, frc);
        gl_FragColor = col;

        #include <tonemapping_fragment>
	      #include <colorspace_fragment>
      }`,
  (self) => {
    self.side = THREE.DoubleSide
  },
)

extend({ GrassMaterial })
