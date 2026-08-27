import * as THREE from 'three'
import { useRef, useMemo } from "react"
import { extend, useFrame } from "@react-three/fiber"
import { shaderMaterial } from "@react-three/drei"
import rainDropUrl from '../assets/rainDrop.png'
import vertShader from '../assets/rain.vert.glsl?raw'
import fragShader from '../assets/rain.frag.glsl?raw'

const rainTexture = new THREE.TextureLoader().load(rainDropUrl)
rainTexture.colorSpace = THREE.SRGBColorSpace

const RainMaterialDef = shaderMaterial({
    uTime: 0,
    uTexture: rainTexture,
    uSize: 5,
    uOpacity: 1,
    uOverallSpeed: 40,
    uColor: new THREE.Color(0xffffff),
    uUvSquash: 1,
    uIntensity: 1,
    uHeight: 15,
}, vertShader, fragShader)
const RainMaterial = extend(RainMaterialDef)

export default function RainSystem({
    count = 40000,
    radius = 20,
    height = 15,
    ...props
}) {
    const materialRef = useRef<any>(null!)

    const geo = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const speeds = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * 2 * Math.PI
            const r = Math.sqrt(Math.random()) * radius
            positions[i * 3] = Math.cos(angle) * r;
            positions[i * 3 + 1] = Math.random() * height
            positions[i * 3 + 2] = Math.sin(angle) * r
            speeds[i] = 0.5 + Math.random()
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
        return geometry
    }, [count, radius, height])

    const lastVerticalFacing = useRef(0)
    const camDir = useRef(new THREE.Vector3())
    useFrame((state) => {
        materialRef.current.uniforms.uTime.value = state.clock.elapsedTime / 4

        state.camera.getWorldDirection(camDir.current)
        const verticalFacing = Math.abs(camDir.current.y)
        if (Math.abs(verticalFacing - lastVerticalFacing.current) > 0.001) {
            lastVerticalFacing.current = verticalFacing
            const sizeScale = THREE.MathUtils.lerp(1, 0.7, verticalFacing)
            const uvSquash = THREE.MathUtils.lerp(1, 0.05, verticalFacing)

            materialRef.current.uniforms.uUvSquash.value = uvSquash
            materialRef.current.uniforms.uSize.value = 8 * sizeScale * (0.5 + 0.5 * uvSquash)
        }
    })

    return (
        <group {...props}>
            <points geometry={geo} frustumCulled={false}>
                <RainMaterial ref={materialRef} depthWrite={false} transparent blending={THREE.NormalBlending} />
            </points>
        </group>
    )
}