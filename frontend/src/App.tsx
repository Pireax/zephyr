import * as THREE from "three"
import { useRef, useState, Suspense, type ComponentProps, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky, Stars, Clouds, Cloud, Billboard, Text } from "@react-three/drei"
import Grass from './components/Grass.tsx'
import { Tree } from './components/Tree.tsx'
import RainSystem from './components/RainSystem.tsx'
import { WeatherClient } from './clients/WeatherClient.ts'
import { VisitorCounterClient } from './clients/VisitorCounterClient.ts'
import './App.css'

function Loading({ onLoadingChange }: { onLoadingChange: (loading: boolean) => void }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    return () => onLoadingChange(false)
  }, [onLoadingChange])

  useFrame((state, delta) => {
    if (!meshRef.current) return

    meshRef.current.rotation.x += delta
    meshRef.current.rotation.y += delta
    const scale = 5 + 0.5 * Math.sin(state.clock.elapsedTime * 2)
    meshRef.current.scale.setScalar(scale)
  })

  const fontProps = { fontSize: 2.5, letterSpacing: -0.05, lineHeight: 1, 'material-toneMapped': false }

  return (
    <group>
      <mesh ref={meshRef}>
        <boxGeometry />
        <meshNormalMaterial />
      </mesh>
      <Billboard>
        <Text color="white" position={[0, -10, 0]} {...fontProps}>
          Loading
        </Text>
      </Billboard>
    </group>
  )
}

function MovingCloud({
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

function formatOrdinal(count: number) {
  const lastTwoDigits = count % 100
  const suffix = lastTwoDigits >= 11 && lastTwoDigits <= 13
    ? 'th'
    : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[count % 10] ?? 'th'

  return `${count}${suffix}`
}

function getCurrentTimeOfDay() {
  const now = new Date()
  return now.getHours() + now.getMinutes() / 60
}

const sunPosition = [10, 10, 5] as [number, number, number]
const windDirection = new THREE.Vector2(1, 1)
const timeOfDay = getCurrentTimeOfDay()
const sunHeight = Math.max(0, Math.sin(((timeOfDay - 6) / 12) * Math.PI))
const isNight = sunHeight === 0
const maxRainCount = 40000

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
      setRainCount(maxRainCount)
    })
  }, [])

  return (
    <>
      <Canvas camera={{ position: [33.25, 5, -48.27] }}>
        <ambientLight intensity={Math.max(0.015, 0.015 + sunHeight * 1.85 - (rainCount / maxRainCount))} />
        <directionalLight position={sunPosition} intensity={0.2 + sunHeight * 0.8} />
        <Suspense fallback={<Loading onLoadingChange={setIsLoading} />}>
          <CameraRig />
          {isNight ? (
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          ) : (
            <Sky distance={450000} sunPosition={sunPosition} inclination={0} azimuth={0.25} />
          )}
          <RainSystem count={rainCount} position={[33.25, 5, -48.27]} windDirection={windDirection} />
          <Grass windDirection={windDirection} />
          <Tree position={[-20, 16.5, 10]} scale={0.01} windDirection={windDirection} />
          <Clouds position={[-80, 0, -80]}>
            <MovingCloud windDirection={windDirection} startingProgress={0.25} initialPosition={new THREE.Vector3(0, 40, 40)} bounds={[20, 5, 30]} growth={30}/>
            <MovingCloud windDirection={windDirection} initialPosition={new THREE.Vector3(-18, 45, 12)} bounds={[10, 10, 40]} growth={20} />
            <MovingCloud windDirection={windDirection} initialPosition={new THREE.Vector3(-80, 50, -16)} bounds={[8, 8, 20]} growth={10} />
            <MovingCloud windDirection={windDirection} initialPosition={new THREE.Vector3(-100, 50, -40)} bounds={[16, 15, 20]} growth={15} />
            <MovingCloud windDirection={windDirection} startingProgress={0.9} initialPosition={new THREE.Vector3(-90, 50, -20)} bounds={[8, 10, 20]} growth={10} />
            <MovingCloud windDirection={windDirection} initialPosition={new THREE.Vector3(-60, 60, -40)} bounds={[8, 4, 20]} growth={30} />
          </Clouds>
        </Suspense>
      </Canvas>

      {!isLoading && (
        <button
          type="button"
          id="floating-card"
          className="glass-card"
          onClick={() => setRainCount((currentCount) => currentCount > 0 ? 0 : maxRainCount)}
        >
          Hi there! You're the {formatOrdinal(count)} visitor.
        </button>
      )}
    </>
  )
}

export default App
