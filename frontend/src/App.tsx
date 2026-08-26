import { useRef, useState, Suspense, type ComponentProps, useEffect } from 'react'
import * as THREE from "three"
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky, Clouds, Cloud, OrbitControls } from "@react-three/drei"
import Grass from './Grass.jsx'
import { Tree } from './Tree.jsx'
import { VisitorCounterClient } from './VisitorCounterClient.ts'
import './App.css'

function Box(props: any) {
  const meshRef = useRef(null)
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)

  useFrame((state, delta) => (meshRef.current.rotation.x += delta))

  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
      </mesh>
  )
}

function MovingClouds({
  windDirection,
  initialPosition,
  driftDistance = 500,
  startingProgress = 0,
  ...cloudProps
}: {
  windDirection: THREE.Vector2
  initialPosition: THREE.Vector3
  driftDistance?: number
  startingProgress?: number
} & Omit<ComponentProps<typeof Cloud>, 'position'>) {
  const cloudsRef = useRef<THREE.Group>(null)
  const targetPosition = initialPosition.clone().add(
    new THREE.Vector3(windDirection.x, 0, windDirection.y)
      .normalize()
      .multiplyScalar(driftDistance),
  )

  useFrame((state) => {
    if (!cloudsRef.current) return

    const progress =
      (startingProgress + (state.clock.elapsedTime) / driftDistance) % 1
    cloudsRef.current.position.lerpVectors(initialPosition, targetPosition, progress)
  })

  return (
    <group ref={cloudsRef} position={initialPosition}>
         <Cloud color="#ffffff" growth={20} {...cloudProps} />
    </group>
  )
}

function CameraRig() {
  const { camera } = useThree()

  useFrame(() => {
    camera.lookAt(0, 10, 0)
  })

  return null
}

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log("Fetching visitor count...")
    let client = new VisitorCounterClient()
    client.postVisitors().then((count: any) => {
      client.getVisitors().then((count: any) => {
        setCount(count)
      })
    })
  }, [])

  const windDirection = new THREE.Vector2(1, 1)

  return (
    <>
      <Canvas camera={{ position: [33.25, 5, -48.27] }}>
        <CameraRig />
        <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
        <ambientLight intensity={Math.PI / 1.5} />
        <directionalLight position={[10, 10, 5]} castShadow intensity={1} />
        <Suspense fallback={null}>
          <Grass windDirection={windDirection} />
        </Suspense>
        <Tree position={[-20, 16.5, 10]} scale={0.01} windDirection={windDirection} />
        <Clouds position={[-80, 0, -80]}>
          <MovingClouds windDirection={windDirection} startingProgress={0.3} initialPosition={new THREE.Vector3(0, 40, 40)} bounds={[20, 5, 30]} growth={30}/>
          <MovingClouds windDirection={windDirection} initialPosition={new THREE.Vector3(-18, 45, 12)} bounds={[10, 10, 40]} growth={20} />
          <MovingClouds windDirection={windDirection} initialPosition={new THREE.Vector3(-80, 50, -16)} bounds={[8, 8, 20]} growth={10} />
          <MovingClouds windDirection={windDirection} initialPosition={new THREE.Vector3(-100, 50, -40)} bounds={[16, 15, 20]} growth={15} />
          <MovingClouds windDirection={windDirection} startingProgress={0.9} initialPosition={new THREE.Vector3(-90, 50, -20)} bounds={[8, 10, 20]} growth={10} />
          <MovingClouds windDirection={windDirection} initialPosition={new THREE.Vector3(-60, 60, -40)} bounds={[8, 4, 20]} growth={30} />
        </Clouds>
        <OrbitControls />
      </Canvas>

      <div id="floating-card" className="glass-card">
        Hi there! You're the {count}th visitor.
      </div>
    </>
  )
}

export default App
