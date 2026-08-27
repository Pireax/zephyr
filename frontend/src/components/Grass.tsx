// Based on https://codesandbox.io/p/sandbox/grass-shader-forked-okub75
import * as THREE from "three"
import { createNoise2D } from "simplex-noise"
import { useRef, useMemo } from "react"
import { extend, useFrame, useLoader } from "@react-three/fiber"
import { shaderMaterial } from "@react-three/drei"
import vertShader from '../assets/grass.vert.glsl?raw'
import fragShader from '../assets/grass.frag.glsl?raw'
import bladeDiffuse from "../assets/blade_diffuse.jpg"
import bladeAlpha from "../assets/blade_alpha.jpg"

function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
const simplex = createNoise2D(mulberry32(125456789))

const GrassMaterialDef = shaderMaterial(
  {
    bladeHeight: 1,
    map: null as THREE.Texture | null,
    alphaMap: null as THREE.Texture | null,
    time: 0,
    windDirection: new THREE.Vector2(1, 1),
    windSpeed: 1,
    tipColor: new THREE.Color(0.0, 0.6, 0.0).convertSRGBToLinear(),
    bottomColor: new THREE.Color(0.0, 0.1, 0.0).convertSRGBToLinear(),
  }, vertShader, fragShader,
  (self) => {
    self!.side = THREE.DoubleSide
  },
)
const GrassMaterial = extend(GrassMaterialDef)

export default function Grass({ options = { bW: 0.12, bH: 1, joints: 5 }, width = 100, instances = 50000, windDirection = new THREE.Vector2(1, 1), windSpeed = 1, ...props }) {
  const { bW, bH, joints } = options
  const materialRef = useRef<any>(null!)
  const [texture, alphaMap] = useLoader(THREE.TextureLoader, [bladeDiffuse, bladeAlpha])
  const attributeData = useMemo(() => getAttributeData(instances, width), [instances, width])
  const baseGeom = useMemo(() => new THREE.PlaneGeometry(bW, bH, 1, joints).translate(0, bH / 2, 0), [options])
  const groundGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, width, 32, 32)
    geo.lookAt(new THREE.Vector3(0, 1, 0))
    for (let i = 0; i < geo.attributes.position.count; i++) {
      const x = geo.attributes.position.getX(i)
      const z = geo.attributes.position.getZ(i)
      const y = getYPosition(x, z)
      geo.attributes.position.setY(i, y)
    }
    geo.computeVertexNormals()
    return geo
  }, [width])
  useFrame((state) => (materialRef.current.uniforms.time.value = state.clock.elapsedTime / 4))
  return (
    <group {...props}>
      <mesh>
        <instancedBufferGeometry index={baseGeom.index} attributes-position={baseGeom.attributes.position} attributes-uv={baseGeom.attributes.uv}>
          <instancedBufferAttribute attach={"attributes-offset"} args={[new Float32Array(attributeData.offsets), 3]} />
          <instancedBufferAttribute attach={"attributes-orientation"} args={[new Float32Array(attributeData.orientations), 4]} />
          <instancedBufferAttribute attach={"attributes-stretch"} args={[new Float32Array(attributeData.stretches), 1]} />
          <instancedBufferAttribute attach={"attributes-halfRootAngleSin"} args={[new Float32Array(attributeData.halfRootAngleSin), 1]} />
          <instancedBufferAttribute attach={"attributes-halfRootAngleCos"} args={[new Float32Array(attributeData.halfRootAngleCos), 1]} />
        </instancedBufferGeometry>
        <GrassMaterial ref={materialRef} map={texture} alphaMap={alphaMap} windDirection={windDirection} windSpeed={windSpeed} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0]} geometry={groundGeo} receiveShadow>
        <meshStandardMaterial color="#0f2f0f" />
      </mesh>
    </group>
  )
}

function getAttributeData(instances: number, width: number) {
  const offsets = []
  const orientations = []
  const stretches = []
  const halfRootAngleSin = []
  const halfRootAngleCos = []

  let quaternion_0 = new THREE.Quaternion()
  let quaternion_1 = new THREE.Quaternion()

  //The min and max angle for the growth direction (in radians)
  const min = -0.25
  const max = 0.25

  //For each instance of the grass blade
  for (let i = 0; i < instances; i++) {
    //Offset of the roots
    const offsetX = Math.random() * width - width / 2
    const offsetZ = Math.random() * width - width / 2
    const offsetY = getYPosition(offsetX, offsetZ)
    offsets.push(offsetX, offsetY, offsetZ)

    //Define random growth directions
    //Rotate around Y
    let angle = Math.PI - Math.random() * (2 * Math.PI)
    halfRootAngleSin.push(Math.sin(0.5 * angle))
    halfRootAngleCos.push(Math.cos(0.5 * angle))

    quaternion_0.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle)

    //Rotate around X
    angle = Math.random() * (max - min) + min
    quaternion_1.setFromAxisAngle(new THREE.Vector3(1, 0, 0), angle)

    //Combine rotations to a single quaternion
    quaternion_0.multiply(quaternion_1)

    //Rotate around Z
    angle = Math.random() * (max - min) + min
    quaternion_1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle)

    //Combine rotations to a single quaternion
    quaternion_0.multiply(quaternion_1)

    orientations.push(quaternion_0.x, quaternion_0.y, quaternion_0.z, quaternion_0.w)

    //Define variety in height
    if (i < instances / 3) {
      stretches.push(Math.random() * 1.8)
    } else {
      stretches.push(Math.random())
    }
  }

  return {
    offsets,
    orientations,
    stretches,
    halfRootAngleCos,
    halfRootAngleSin,
  }
}

function getYPosition(x: number, z: number) {
  var y = 2 * simplex(x / 50, z / 50)
  y += 4 * simplex(x / 100, z / 100)
  y += 0.2 * simplex(x / 10, z / 10)
  return y
}
