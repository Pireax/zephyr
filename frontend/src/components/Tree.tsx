import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame, type ThreeElements } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import treeUrl from '../assets/ghibli_stylized_tree.glb?no-inline'

type TreeProps = ThreeElements['group'] & {
  windDirection?: THREE.Vector2
}

export function Tree({ windDirection = new THREE.Vector2(1, 1), ...props }: TreeProps) {
  const { nodes, materials } = useGLTF(treeUrl) as any
  const shaderRef = useRef<any>(null!)

  materials.Stylised_Foliage.onBeforeCompile = (shader: any) => {
    shader.uniforms.time = { value: 0 }
    shader.uniforms.windDirection = { value: windDirection }
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        #include <snoise>
        uniform float time;
        uniform vec2 windDirection;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec2 windPosition = position.xy * 0.05 + windDirection * time * 0.25;
        float windNoise = snoise(windPosition);
        transformed.xy += windDirection * windNoise;`,
      )
    shaderRef.current = shader
  }

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.time.value = state.clock.elapsedTime
    }
  })

  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={100}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Foliage_Stylised_Foliage_0.geometry}
          material={materials.Stylised_Foliage}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Foliage_Stylised_Foliage_0_1.geometry}
          material={materials.Stylised_Foliage}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Foliage_Stylised_Foliage_0_2.geometry}
          material={materials.Stylised_Foliage}
        />
      </group>
      <group position={[100.113, -202.425, -46.01]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Foliage_Instance|Foliage|Dupli|_Stylised_Foliage_0'].geometry}
          material={materials.Stylised_Foliage}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Foliage_Instance|Foliage|Dupli|_Stylised_Foliage_0_1'].geometry}
          material={materials.Stylised_Foliage}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Foliage_Instance|Foliage|Dupli|_Stylised_Foliage_0_2'].geometry}
          material={materials.Stylised_Foliage}
        />
      </group>
      <group
        position={[-264.168, -359.639, -181.614]}
        rotation={[-Math.PI / 2, 0, -2.411]}
        scale={100}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Foliage_Instance001|Foliage|Dupli|_Stylised_Foliage_0'].geometry}
          material={materials.Stylised_Foliage}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Foliage_Instance001|Foliage|Dupli|_Stylised_Foliage_0_1'].geometry}
          material={materials.Stylised_Foliage}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Foliage_Instance001|Foliage|Dupli|_Stylised_Foliage_0_2'].geometry}
          material={materials.Stylised_Foliage}
        />
      </group>
      <group position={[-173.474, -390.441, -36]} rotation={[-Math.PI / 2, 0, -2.411]} scale={100}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Foliage_Instance002|Foliage|Dupli|_Stylised_Foliage_0'].geometry}
          material={materials.Stylised_Foliage}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Foliage_Instance002|Foliage|Dupli|_Stylised_Foliage_0_1'].geometry}
          material={materials.Stylised_Foliage}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Foliage_Instance002|Foliage|Dupli|_Stylised_Foliage_0_2'].geometry}
          material={materials.Stylised_Foliage}
        />
      </group>
      <group
        position={[202.377, -458.274, -117.873]}
        rotation={[-Math.PI / 2, 0, -2.411]}
        scale={100}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Foliage_Instance003|Foliage|Dupli|_Stylised_Foliage_0'].geometry}
          material={materials.Stylised_Foliage}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Foliage_Instance003|Foliage|Dupli|_Stylised_Foliage_0_1'].geometry}
          material={materials.Stylised_Foliage}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Foliage_Instance003|Foliage|Dupli|_Stylised_Foliage_0_2'].geometry}
          material={materials.Stylised_Foliage}
        />
      </group>
      <group position={[-149.44, -358.179, -244.36]} rotation={[-1.911, 0.532, -0.385]} scale={100}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Foliage_Instance004|Foliage|Dupli|_Stylised_Foliage_0'].geometry}
          material={materials.Stylised_Foliage}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Foliage_Instance004|Foliage|Dupli|_Stylised_Foliage_0_1'].geometry}
          material={materials.Stylised_Foliage}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Foliage_Instance004|Foliage|Dupli|_Stylised_Foliage_0_2'].geometry}
          material={materials.Stylised_Foliage}
        />
      </group>
      <group
        position={[47.592, -298.926, -298.065]}
        rotation={[-Math.PI / 2, 0, -2.242]}
        scale={100}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Foliage_Instance005|Foliage|Dupli|_Stylised_Foliage_0'].geometry}
          material={materials.Stylised_Foliage}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Foliage_Instance005|Foliage|Dupli|_Stylised_Foliage_0_1'].geometry}
          material={materials.Stylised_Foliage}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['Foliage_Instance005|Foliage|Dupli|_Stylised_Foliage_0_2'].geometry}
          material={materials.Stylised_Foliage}
        />
      </group>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Particle_Emitter_Stylised_Foliage_0.geometry}
        material={materials.Stylised_Foliage}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Custom_Normals_Stylised_Foliage_0.geometry}
        material={materials.Stylised_Foliage}
        position={[1.443, 1.705, -1.271]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Trunk_Material_0.geometry}
        material={materials.Material}
        position={[221.034, -1456.648, -149.041]}
        rotation={[-Math.PI / 2, 0, 1.365]}
        scale={100}
      />
    </group>
  )
}

useGLTF.preload(treeUrl)
