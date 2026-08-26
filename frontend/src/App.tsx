import { useRef, useState, Suspense, type ComponentProps, useEffect } from 'react'
import * as THREE from "three"
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky, Clouds, Cloud, OrbitControls } from "@react-three/drei"
// @ts-ignore
import Grass from './components/Grass.jsx'
// @ts-ignore
import { Tree } from './components/Tree'
import { WeatherClient } from './clients/WeatherClient.ts'
import { VisitorCounterClient } from './clients/VisitorCounterClient.ts'
import './App.css'
import RainSystem from './components/RainSystem.tsx'

function Loading({ onLoadingChange }: { onLoadingChange: (loading: boolean) => void }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    onLoadingChange(true)

    return () => onLoadingChange(false)
  }, [onLoadingChange])

  useFrame((_state, delta) => {
    if (!meshRef.current) return

    meshRef.current.rotation.x += delta
    meshRef.current.rotation.y += delta
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry />
      <meshNormalMaterial />
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
  const [rainCount, setRainCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let visClient = new VisitorCounterClient()
    visClient.postVisitors().then((count: any) => {
      setCount(count)
    })

    let weatherClient = new WeatherClient();
    weatherClient.getWeather().then((result: any) => {
      if (result.precipitation <= 0) return
      setRainCount(40000)
    })
  }, [])

  const windDirection = new THREE.Vector2(1, 1)

  return (
    <>
      <Canvas camera={{ position: [33.25, 5, -48.27] }}>
        <ambientLight intensity={Math.PI / 1.5} />
        <directionalLight position={[10, 10, 5]} castShadow intensity={1} />
        <Suspense fallback={<Loading onLoadingChange={setIsLoading} />}>
          <CameraRig />
          <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
          <RainSystem count={rainCount} position={[33.25, 5, -48.27]} />
          <Grass windDirection={windDirection} />
          <Tree position={[-20, 16.5, 10]} scale={0.01} windDirection={windDirection} />
          <Clouds position={[-80, 0, -80]}>
            <MovingClouds windDirection={windDirection} startingProgress={0.3} initialPosition={new THREE.Vector3(0, 40, 40)} bounds={[20, 5, 30]} growth={30}/>
            <MovingClouds windDirection={windDirection} initialPosition={new THREE.Vector3(-18, 45, 12)} bounds={[10, 10, 40]} growth={20} />
            <MovingClouds windDirection={windDirection} initialPosition={new THREE.Vector3(-80, 50, -16)} bounds={[8, 8, 20]} growth={10} />
            <MovingClouds windDirection={windDirection} initialPosition={new THREE.Vector3(-100, 50, -40)} bounds={[16, 15, 20]} growth={15} />
            <MovingClouds windDirection={windDirection} startingProgress={0.9} initialPosition={new THREE.Vector3(-90, 50, -20)} bounds={[8, 10, 20]} growth={10} />
            <MovingClouds windDirection={windDirection} initialPosition={new THREE.Vector3(-60, 60, -40)} bounds={[8, 4, 20]} growth={30} />
          </Clouds>
        </Suspense>
        <OrbitControls />
      </Canvas>

      {!isLoading && (
        <div id="floating-card" className="glass-card">
          Hi there! You're the {count}th visitor.
        </div>
      )}
    </>
  )
}

export default App
