import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls, Sky } from '@react-three/drei'
import {
  ArrowRight,
  BookOpenText,
  Crown,
  Info,
  MapTrifold,
  MouseSimple,
  PersonSimple,
  ShieldCheck,
  SignOut,
  Sparkle,
  X,
} from '@phosphor-icons/react'
import * as THREE from 'three'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FACTS, ROLES, SITE } from './content.js'

const CUBIT = 0.45
const COURT = { width: 50 * CUBIT, length: 100 * CUBIT, height: 5 * CUBIT }
const TENT = { width: 10 * CUBIT, length: 30 * CUBIT, height: 10 * CUBIT, front: -0.5 }
const TENT_BACK = TENT.front - TENT.length
const VEIL_Z = TENT_BACK + 10 * CUBIT

const ROLE_ICONS = { people: PersonSimple, priest: ShieldCheck, highPriest: Crown }

const HOTSPOTS = [
  { id: 'gate', p: [0, 1.2, 21] },
  { id: 'altar', p: [0, 1.1, 10] },
  { id: 'laver', p: [0, 1.0, 3] },
  { id: 'tent', p: [2.8, 1.6, -1.2] },
  { id: 'lamp', p: [-1.5, 1.15, -6.8] },
  { id: 'table', p: [1.55, 1.0, -6.7] },
  { id: 'incense', p: [0, 1.0, VEIL_Z + 1.25] },
  { id: 'veil', p: [0, 1.4, VEIL_Z + 0.25] },
  { id: 'ark', p: [0, 1.1, TENT_BACK + 2.3] },
]

const gold = '#bd8f35'
const bronze = '#875228'
const linen = '#e9e2ce'
const acacia = '#70401f'
const blue = '#204e7d'
const purple = '#633e73'
const scarlet = '#8f2f28'

function Box({ position, args, color, roughness = 0.55, metalness = 0, children }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
      {children}
    </mesh>
  )
}

function CourtCurtain({ position, args }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={linen} roughness={0.96} side={THREE.DoubleSide} />
    </mesh>
  )
}

function Post({ position, height = COURT.height, goldTop = false }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.075, height, 8]} />
        <meshStandardMaterial color={acacia} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.1, 8]} />
        <meshStandardMaterial color={bronze} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, height - 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.32, 8]} />
        <meshStandardMaterial color={goldTop ? gold : '#b7b8ad'} metalness={0.8} roughness={0.25} />
      </mesh>
    </group>
  )
}

function OuterCourt() {
  const longPosts = Array.from({ length: 20 }, (_, i) => -COURT.length / 2 + (i + 0.5) * (COURT.length / 20))
  const westPosts = Array.from({ length: 10 }, (_, i) => -COURT.width / 2 + (i + 0.5) * (COURT.width / 10))
  const eastPosts = [-10.125, -7.875, -5.625, -4.5, -1.5, 1.5, 4.5, 5.625, 7.875, 10.125]
  return (
    <group>
      <CourtCurtain position={[-COURT.width / 2, COURT.height / 2, 0]} args={[0.035, COURT.height, COURT.length]} />
      <CourtCurtain position={[COURT.width / 2, COURT.height / 2, 0]} args={[0.035, COURT.height, COURT.length]} />
      <CourtCurtain position={[0, COURT.height / 2, -COURT.length / 2]} args={[COURT.width, COURT.height, 0.035]} />
      <CourtCurtain position={[-(COURT.width / 2 - 15 * CUBIT / 2), COURT.height / 2, COURT.length / 2]} args={[15 * CUBIT, COURT.height, 0.035]} />
      <CourtCurtain position={[(COURT.width / 2 - 15 * CUBIT / 2), COURT.height / 2, COURT.length / 2]} args={[15 * CUBIT, COURT.height, 0.035]} />
      {longPosts.map((z) => <Post key={`l${z}`} position={[-COURT.width / 2, 0, z]} />)}
      {longPosts.map((z) => <Post key={`r${z}`} position={[COURT.width / 2, 0, z]} />)}
      {westPosts.map((x) => <Post key={`w${x}`} position={[x, 0, -COURT.length / 2]} />)}
      {eastPosts.map((x) => <Post key={`e${x}`} position={[x, 0, COURT.length / 2]} />)}
      <GateTextile />
    </group>
  )
}

function CherubMotif({ x }) {
  return (
    <group position={[x, 0, 0.03]}>
      <mesh position={[0, 0.24, 0]}><sphereGeometry args={[0.09, 12, 8]} /><meshStandardMaterial color={gold} metalness={0.35} roughness={0.55} /></mesh>
      <mesh position={[-0.18, 0, 0]} rotation={[0, 0, -0.62]}><boxGeometry args={[0.36, 0.08, 0.025]} /><meshStandardMaterial color={gold} metalness={0.35} roughness={0.55} /></mesh>
      <mesh position={[0.18, 0, 0]} rotation={[0, 0, 0.62]}><boxGeometry args={[0.36, 0.08, 0.025]} /><meshStandardMaterial color={gold} metalness={0.35} roughness={0.55} /></mesh>
    </group>
  )
}

function StripedPanel({ width, height, position, rotation = [0, 0, 0], opacity = 1, cherubim = false }) {
  const stripeW = width / 12
  const colors = [blue, linen, scarlet, linen, purple, linen, blue, linen, scarlet, linen, purple, linen]
  return (
    <group position={position} rotation={rotation}>
      {colors.map((color, i) => (
        <mesh key={i} position={[-width / 2 + stripeW / 2 + i * stripeW, 0, 0]} castShadow>
          <boxGeometry args={[stripeW + 0.006, height, 0.025]} />
          <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {cherubim && <><CherubMotif x={-1.15} /><CherubMotif x={1.15} /></>}
    </group>
  )
}

function GateTextile() {
  return <StripedPanel width={9} height={2.25} position={[0, 1.125, 22.47]} opacity={0.72} />
}

function Tent() {
  const sideBoards = Array.from({ length: 20 }, (_, i) => TENT.front - (i + 0.5) * (TENT.length / 20))
  const backBoards = Array.from({ length: 8 }, (_, i) => -TENT.width / 2 + (i + 0.5) * (TENT.width / 8))
  return (
    <group>
      {sideBoards.map((z, i) => (
        <group key={`boards${i}`}>
          <Box position={[-TENT.width / 2, TENT.height / 2, z]} args={[0.09, TENT.height, 0.64]} color={gold} metalness={0.62} roughness={0.3} />
          <Box position={[TENT.width / 2, TENT.height / 2, z]} args={[0.09, TENT.height, 0.64]} color={gold} metalness={0.62} roughness={0.3} />
        </group>
      ))}
      {backBoards.map((x, i) => <Box key={`back${i}`} position={[x, TENT.height / 2, TENT_BACK]} args={[0.53, TENT.height, 0.09]} color={gold} metalness={0.62} roughness={0.3} />)}
      <Box position={[0, TENT.height + 0.04, (TENT.front + TENT_BACK) / 2]} args={[TENT.width + 0.15, 0.05, TENT.length + 0.25]} color={linen} roughness={0.96} />
      <Box position={[0, TENT.height + 0.11, (TENT.front + TENT_BACK) / 2]} args={[TENT.width + 0.35, 0.07, TENT.length + 0.55]} color="#5a4937" roughness={1} />
      <Box position={[0, TENT.height + 0.2, (TENT.front + TENT_BACK) / 2]} args={[TENT.width + 0.55, 0.08, TENT.length + 0.8]} color="#7c3029" roughness={0.9} />
      <Box position={[0, TENT.height + 0.3, (TENT.front + TENT_BACK) / 2]} args={[TENT.width + 0.75, 0.08, TENT.length + 1]} color="#40372e" roughness={1} />
      <StripedPanel width={TENT.width} height={TENT.height} position={[0, TENT.height / 2, TENT.front + 0.02]} opacity={0.76} />
      <StripedPanel width={TENT.width} height={TENT.height} position={[0, TENT.height / 2, VEIL_Z]} opacity={0.72} cherubim />
      {[-2.25, -1.125, 0, 1.125, 2.25].map((x) => <Post key={`front${x}`} position={[x, 0, TENT.front + 0.06]} height={TENT.height} goldTop />)}
      {[-2.1, -0.7, 0.7, 2.1].map((x) => <Post key={`veil${x}`} position={[x, 0, VEIL_Z + 0.05]} height={TENT.height} goldTop />)}
    </group>
  )
}

function Horn({ position, material }) {
  return (
    <mesh position={position} castShadow>
      <coneGeometry args={[0.13, 0.42, 8]} />
      <meshStandardMaterial color={material} metalness={0.7} roughness={0.32} />
    </mesh>
  )
}

function BronzeAltar() {
  return (
    <group position={[0, 0, 10]}>
      <Box position={[0, 0.675, 0]} args={[2.25, 1.35, 2.25]} color={bronze} metalness={0.65} roughness={0.38} />
      {[[-1.0, 1.5, -1], [1, 1.5, -1], [-1, 1.5, 1], [1, 1.5, 1]].map((p, i) => <Horn key={i} position={p} material={bronze} />)}
      <mesh position={[0, 1.37, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.75, 1.75]} />
        <meshStandardMaterial color="#24150e" roughness={1} wireframe />
      </mesh>
      {[-1.18, 1.18].map((x) => (
        <mesh key={x} position={[x, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 3.25, 10]} />
          <meshStandardMaterial color={bronze} metalness={0.68} roughness={0.34} />
        </mesh>
      ))}
      {[-1.13, 1.13].flatMap((x) => [-0.85, 0.85].map((z) => (
        <mesh key={`altar-ring-${x}-${z}`} position={[x, 0.55, z]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.09, 0.025, 8, 18]} />
          <meshStandardMaterial color={bronze} metalness={0.72} roughness={0.3} />
        </mesh>
      )))}
    </group>
  )
}

function Laver() {
  return (
    <group position={[0, 0, 3]}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.72, 0.48, 0.5, 24]} />
        <meshStandardMaterial color={bronze} metalness={0.72} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.61, 32]} />
        <meshStandardMaterial color="#557f88" metalness={0.25} roughness={0.18} />
      </mesh>
      <mesh position={[0, 0.38, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.42, 0.48, 18]} />
        <meshStandardMaterial color={bronze} metalness={0.72} roughness={0.28} />
      </mesh>
    </group>
  )
}

function Table() {
  const loaves = Array.from({ length: 12 }, (_, i) => {
    const row = Math.floor(i / 6)
    const column = i % 6
    return [-0.33 + column * 0.132, 0.72, row === 0 ? -0.1 : 0.1]
  })
  return (
    <group position={[1.55, 0, -6.7]}>
      <Box position={[0, 0.62, 0]} args={[0.9, 0.11, 0.45]} color={gold} metalness={0.75} roughness={0.22} />
      {[[-0.38, 0.31, -0.16], [0.38, 0.31, -0.16], [-0.38, 0.31, 0.16], [0.38, 0.31, 0.16]].map((p, i) => <Box key={i} position={p} args={[0.06, 0.62, 0.06]} color={gold} metalness={0.75} roughness={0.22} />)}
      {loaves.map((position, i) => <Box key={i} position={position} args={[0.1, 0.055, 0.14]} color="#d2a85f" roughness={0.85} />)}
    </group>
  )
}

function Lampstand() {
  const branches = [-0.42, -0.27, -0.13, 0, 0.13, 0.27, 0.42]
  return (
    <group position={[-1.5, 0, -6.8]}>
      <mesh position={[0, 0.18, 0]} castShadow><cylinderGeometry args={[0.3, 0.38, 0.12, 20]} /><meshStandardMaterial color={gold} metalness={0.85} roughness={0.18} /></mesh>
      {branches.map((x, i) => (
        <group key={x}>
          <mesh position={[x, 0.62 + Math.abs(3 - i) * 0.07, 0]} castShadow><cylinderGeometry args={[0.025, 0.035, 0.82, 10]} /><meshStandardMaterial color={gold} metalness={0.85} roughness={0.18} /></mesh>
          <mesh position={[x, 1.05 + Math.abs(3 - i) * 0.07, 0]}><sphereGeometry args={[0.08, 12, 8]} /><meshStandardMaterial color="#ffb24a" emissive="#ff6b1a" emissiveIntensity={3} /></mesh>
          <pointLight position={[x, 1.05, 0]} color="#ff9b46" intensity={0.7} distance={4} />
        </group>
      ))}
    </group>
  )
}

function IncenseAltar() {
  return (
    <group position={[0, 0, VEIL_Z + 1.25]}>
      <Box position={[0, 0.45, 0]} args={[0.45, 0.9, 0.45]} color={gold} metalness={0.78} roughness={0.2} />
      {[[-0.18, 1.0, -0.18], [0.18, 1.0, -0.18], [-0.18, 1.0, 0.18], [0.18, 1.0, 0.18]].map((p, i) => <Horn key={i} position={p} material={gold} />)}
    </group>
  )
}

function Ark() {
  return (
    <group position={[0, 0, TENT_BACK + 2.3]}>
      <Box position={[0, 0.42, 0]} args={[1.125, 0.675, 0.675]} color={gold} metalness={0.82} roughness={0.18} />
      <Box position={[0, 0.79, 0]} args={[1.18, 0.07, 0.72]} color="#d4a844" metalness={0.9} roughness={0.14} />
      {[-0.43, 0.43].flatMap((x) => [-0.37, 0.37].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, 0.28, z]}>
          <torusGeometry args={[0.085, 0.018, 8, 18]} />
          <meshStandardMaterial color={gold} metalness={0.88} roughness={0.16} />
        </mesh>
      )))}
      {[-0.43, 0.43].map((z) => (
        <mesh key={`pole-${z}`} position={[0, 0.28, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 1.9, 10]} />
          <meshStandardMaterial color={gold} metalness={0.8} roughness={0.22} />
        </mesh>
      ))}
      {[-0.32, 0.32].map((x) => (
        <group key={x} position={[x, 1.02, 0]} rotation={[0, 0, x < 0 ? -0.25 : 0.25]}>
          <mesh castShadow><sphereGeometry args={[0.1, 12, 10]} /><meshStandardMaterial color={gold} metalness={0.88} roughness={0.15} /></mesh>
          <mesh position={[x < 0 ? 0.12 : -0.12, 0.06, 0]} rotation={[0, 0, x < 0 ? -0.7 : 0.7]} castShadow><boxGeometry args={[0.38, 0.05, 0.28]} /><meshStandardMaterial color={gold} metalness={0.88} roughness={0.15} /></mesh>
        </group>
      ))}
      <pointLight position={[0, 2.1, 0]} color="#fff4c2" intensity={2.8} distance={5} />
    </group>
  )
}

function Hotspot({ spot, active, onNear }) {
  const ref = useRef()
  const { camera } = useThree()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.position.y = spot.p[1] + Math.sin(clock.elapsedTime * 1.8 + spot.p[2]) * 0.08
    const distance = camera.position.distanceTo(ref.current.position)
    if (distance < 2.2) onNear(spot.id, distance)
  })
  return (
    <group ref={ref} position={spot.p}>
      <mesh>
        <octahedronGeometry args={[active ? 0.13 : 0.1, 0]} />
        <meshStandardMaterial color="#f0c66a" emissive="#c28b28" emissiveIntensity={active ? 3 : 1.5} />
      </mesh>
      <pointLight color="#f0c66a" intensity={active ? 0.8 : 0.25} distance={1.8} />
    </group>
  )
}

function Player({ role, started, fact, onDenied, onLockChange, touchMode, touchInput }) {
  const { camera } = useThree()
  const keys = useRef(new Set())
  const velocity = useRef(new THREE.Vector3())
  const forwardVector = useRef(new THREE.Vector3())
  const rightVector = useRef(new THREE.Vector3())
  const lastSafe = useRef(new THREE.Vector3(0, 1.65, 18.5))
  const controls = useRef()
  const deniedRef = useRef({ message: '', at: 0 })
  const touchEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))

  useEffect(() => {
    camera.position.set(0, 1.65, 18.5)
    camera.lookAt(0, 1.5, 8)
    lastSafe.current.copy(camera.position)
  }, [camera, role])

  useEffect(() => {
    if (fact) {
      keys.current.clear()
      velocity.current.set(0, 0, 0)
    }
  }, [fact])

  useEffect(() => {
    const down = (event) => {
      if (fact) return
      keys.current.add(event.code)
    }
    const up = (event) => keys.current.delete(event.code)
    const clear = () => keys.current.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
    }
  }, [fact])

  useFrame((_, delta) => {
    if (!started || fact || (!touchMode && !controls.current?.isLocked)) return
    const speed = keys.current.has('ShiftLeft') ? 5.2 : 3.2
    const touchKeys = touchInput.current.keys
    const forward = Number(keys.current.has('KeyW') || keys.current.has('ArrowUp') || touchKeys.has('KeyW')) - Number(keys.current.has('KeyS') || keys.current.has('ArrowDown') || touchKeys.has('KeyS'))
    const side = Number(keys.current.has('KeyD') || keys.current.has('ArrowRight') || touchKeys.has('KeyD')) - Number(keys.current.has('KeyA') || keys.current.has('ArrowLeft') || touchKeys.has('KeyA'))
    if (touchMode && (touchInput.current.lookX || touchInput.current.lookY)) {
      touchEuler.current.setFromQuaternion(camera.quaternion)
      touchEuler.current.y -= touchInput.current.lookX * 0.003
      touchEuler.current.x -= touchInput.current.lookY * 0.003
      touchEuler.current.x = Math.max(-1.35, Math.min(1.35, touchEuler.current.x))
      camera.quaternion.setFromEuler(touchEuler.current)
      touchInput.current.lookX = 0
      touchInput.current.lookY = 0
    }
    velocity.current.set(side, 0, -forward).normalize().multiplyScalar(speed * Math.min(delta, 0.05))
    if (forward || side) {
      if (touchMode) {
        forwardVector.current.set(0, 0, -1).applyQuaternion(camera.quaternion).setY(0).normalize()
        rightVector.current.set(1, 0, 0).applyQuaternion(camera.quaternion).setY(0).normalize()
        camera.position.addScaledVector(rightVector.current, velocity.current.x)
        camera.position.addScaledVector(forwardVector.current, -velocity.current.z)
      } else {
        controls.current.moveRight(velocity.current.x)
        controls.current.moveForward(-velocity.current.z)
      }
    }
    camera.position.y = 1.65

    const p = camera.position
    let valid = Math.abs(p.x) < COURT.width / 2 - 0.22 && p.z < COURT.length / 2 - 0.2 && p.z > -COURT.length / 2 + 0.2
    const playerRadius = 0.22
    const tentInnerX = TENT.width / 2 - playerRadius
    const tentOuterX = TENT.width / 2 + playerRadius
    const inTentX = Math.abs(p.x) < tentInnerX
    const atTentDepth = p.z < TENT.front + 0.12 && p.z > TENT_BACK + 0.16
    const inSideWall = atTentDepth && Math.abs(p.x) >= tentInnerX && Math.abs(p.x) <= tentOuterX
    const inBackWall = Math.abs(p.x) <= tentOuterX && p.z <= TENT_BACK + playerRadius && p.z >= TENT_BACK - playerRadius
    if (inSideWall || inBackWall) valid = false
    const notifyDenied = (message) => {
      const now = performance.now()
      if (deniedRef.current.message !== message || now - deniedRef.current.at > 900) {
        deniedRef.current = { message, at: now }
        onDenied(message)
      }
    }
    if (atTentDepth && inTentX && role === 'people') {
      valid = false
      notifyDenied('Chỉ những thầy tế lễ đã được biệt riêng ra thánh mới được phép vào Nơi Thánh.')
    }
    if (p.z < VEIL_Z + 0.1 && inTentX && role === 'priest') {
      valid = false
      notifyDenied('Chỉ thầy tế lễ thượng phẩm mới được phép đi qua bức màn để vào Nơi Chí Thánh, mỗi năm một lần.')
    }
    const collidesBox = (cx, cz, halfX, halfZ) => Math.abs(p.x - cx) < halfX + playerRadius && Math.abs(p.z - cz) < halfZ + playerRadius
    const collidesCircle = (cx, cz, radius) => Math.hypot(p.x - cx, p.z - cz) < radius + playerRadius
    if (collidesBox(0, 10, 1.125, 1.125) || collidesCircle(0, 3, 0.72)) valid = false
    if (inTentX && atTentDepth && (
      collidesBox(1.55, -6.7, 0.45, 0.225) ||
      collidesCircle(-1.5, -6.8, 0.48) ||
      collidesBox(0, VEIL_Z + 1.25, 0.225, 0.225) ||
      collidesBox(0, TENT_BACK + 2.3, 0.57, 0.35)
    )) valid = false
    if (!valid) p.copy(lastSafe.current)
    else lastSafe.current.copy(p)
  })

  if (!started || fact || touchMode) return null

  return (
    <PointerLockControls
      ref={controls}
      selector="#resume-walk, .resume"
      onLock={() => onLockChange(true)}
      onUnlock={() => onLockChange(false)}
    />
  )
}

function World({ role, started, fact, activeSpot, onNear, onDenied, onLockChange, touchMode, touchInput }) {
  return (
    <>
      <color attach="background" args={['#c8b695']} />
      <fog attach="fog" args={['#c8b695', 40, 200]} />
      <Sky distance={900} sunPosition={[18, 24, 12]} inclination={0.52} azimuth={0.22} turbidity={6} rayleigh={1.0} />
      <ambientLight intensity={0.9} color="#fff0db" />
      <hemisphereLight skyColor="#ffeed4" groundColor="#785a3a" intensity={0.85} />
      <directionalLight position={[14, 22, 10]} intensity={2.2} color="#fff6e5" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-28} shadow-camera-right={28} shadow-camera-top={34} shadow-camera-bottom={-34} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#9b7c52" roughness={1} />
      </mesh>
      <gridHelper args={[90, 180, '#8e744f', '#8e744f']} position={[0, 0.006, 0]} material-opacity={0.16} material-transparent />
      <OuterCourt />
      <Tent />
      <BronzeAltar />
      <Laver />
      <Table />
      <Lampstand />
      <IncenseAltar />
      <Ark />
      {HOTSPOTS.map((spot) => <Hotspot key={spot.id} spot={spot} active={activeSpot === spot.id} onNear={onNear} />)}
      <Player role={role} started={started} fact={fact} onDenied={onDenied} onLockChange={onLockChange} touchMode={touchMode} touchInput={touchInput} />
    </>
  )
}

function RoleIcon({ role, size = 20 }) {
  const Icon = ROLE_ICONS[role]
  return <Icon size={size} weight="regular" />
}

function Intro({ role, setRole, onStart }) {
  return (
    <div className="intro">
      <div className="intro__brand"><span className="brand-mark">ת</span><span>{SITE.brand}</span></div>
      <div className="intro__content">
        <p className="eyebrow">{SITE.eyebrow}</p>
        <h1>{SITE.title}</h1>
        <p className="intro__lead">{SITE.lead}</p>
        <div className="role-list" role="radiogroup" aria-label="Choose a role">
          {Object.entries(ROLES).sort(([, a], [, b]) => Number(a.order) - Number(b.order)).map(([key, item]) => {
            const Icon = ROLE_ICONS[key]
            return (
              <button key={key} className={`role-option ${role === key ? 'is-selected' : ''}`} onClick={() => setRole(key)} role="radio" aria-checked={role === key}>
                <span className="role-option__icon"><Icon size={22} /></span>
                <span className="role-option__copy"><strong>{item.name}</strong><small>{item.access}</small></span>
                <span className="role-option__check">{role === key ? 'Selected' : 'Choose'}</span>
              </button>
            )
          })}
        </div>
        <button id="enter-world" className="primary-button" onClick={onStart}>Nhập vai {ROLES[role].name}<ArrowRight size={18} weight="bold" /></button>
      </div>
      <div className="intro__note"><BookOpenText size={18} /><span>{SITE.note}</span></div>
      <div className="intro__scale"><span>{SITE.scaleValue}</span><i></i><span>{SITE.scaleLabel}</span></div>
    </div>
  )
}

function MiniMap({ role }) {
  return (
    <div className="map" aria-label="Plan of the Tabernacle">
      <div className="map__head"><MapTrifold size={16} /><span>Mặt bằng</span><span>1:500</span></div>
      <div className="map__plan">
        <div className="map__court">
          <span className="map__gate">CỔNG PHÍA ĐÔNG</span>
          <span className="map__altar"></span>
          <span className="map__laver"></span>
          <div className="map__tent"><span className="map__veil"></span><span className="map__ark"></span></div>
        </div>
      </div>
      <div className="map__legend"><RoleIcon role={role} size={15} /><span>{ROLES[role].name}</span></div>
    </div>
  )
}

function TouchControls({ input }) {
  const lookPointer = useRef(null)
  const press = (code) => (event) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    input.current.keys.add(code)
  }
  const release = (code) => (event) => {
    input.current.keys.delete(code)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  const startLook = (event) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    lookPointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
  }
  const moveLook = (event) => {
    if (!lookPointer.current || lookPointer.current.id !== event.pointerId) return
    input.current.lookX += event.clientX - lookPointer.current.x
    input.current.lookY += event.clientY - lookPointer.current.y
    lookPointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
  }
  const endLook = (event) => {
    if (lookPointer.current?.id === event.pointerId) lookPointer.current = null
  }
  return (
    <div className="touch-controls" aria-label="Touch controls">
      <div className="touch-move">
        <button className="touch-key touch-key--up" aria-label="Move forward" onPointerDown={press('KeyW')} onPointerUp={release('KeyW')} onPointerCancel={release('KeyW')}>W</button>
        <button className="touch-key touch-key--left" aria-label="Move left" onPointerDown={press('KeyA')} onPointerUp={release('KeyA')} onPointerCancel={release('KeyA')}>A</button>
        <button className="touch-key touch-key--down" aria-label="Move backward" onPointerDown={press('KeyS')} onPointerUp={release('KeyS')} onPointerCancel={release('KeyS')}>S</button>
        <button className="touch-key touch-key--right" aria-label="Move right" onPointerDown={press('KeyD')} onPointerUp={release('KeyD')} onPointerCancel={release('KeyD')}>D</button>
      </div>
      <div className="touch-look" onPointerDown={startLook} onPointerMove={moveLook} onPointerUp={endLook} onPointerCancel={endLook}>
        <MouseSimple size={22} />
        <span>Drag to look</span>
      </div>
    </div>
  )
}

function GameUI({ role, activeSpot, fact, denied, locked, touchMode, touchInput, onInspect, onCloseFact, onExit }) {
  const resume = () => {
    try {
      const res = document.querySelector('canvas')?.requestPointerLock()
      if (res && typeof res.catch === 'function') res.catch(() => {})
    } catch {
      // Ignored
    }
  }
  return (
    <div className="game-ui">
      <header className="topbar">
        <div className="wordmark"><span className="brand-mark">ת</span><span>{SITE.brand}</span></div>
        <div className="role-chip"><RoleIcon role={role} /><span>{ROLES[role].name}</span><small>{ROLES[role].access}</small></div>
        <button className="icon-button" aria-label="Leave experience" onClick={onExit}><SignOut size={20} /></button>
      </header>
      <MiniMap role={role} />
      <div className="crosshair"><i></i><i></i></div>
      {!touchMode && !locked && !fact && (
        <button id="resume-walk" className="resume" onClick={resume}>
          <MouseSimple size={22} />
          <strong>Click chuột để di chuyển</strong>
          <span>Điều khiển chuột để quan sát · WASD để di chuyển · Esc để dừng</span>
        </button>
      )}
      {activeSpot && !fact && <button className={`interact ${touchMode ? 'is-touch' : ''}`} onClick={onInspect}><span className="key">{touchMode ? 'Tap' : 'E'}</span><span>Kiểm tra {FACTS[activeSpot].title}</span></button>}
      {denied && <div className="denied"><Info size={18} weight="fill" /><span>{denied}</span></div>}
      <div className="controls"><MouseSimple size={18} /><span>Quan sát</span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span>Di chuyển</span><kbd>Shift</kbd><span>Di chuyển nhanh hơn</span></div>
      {touchMode && !fact && <TouchControls input={touchInput} />}
      {fact && (
        <aside className="fact-panel">
          <button className="fact-panel__close" onClick={onCloseFact} aria-label="Close information"><X size={20} /></button>
          <div className="fact-panel__icon"><Sparkle size={18} /></div>
          <p>{fact.ref}</p>
          <h2>{fact.title}</h2>
          <strong>{fact.dimensions}</strong>
          <div className="fact-panel__rule"></div>
          <p className="fact-panel__body">{fact.body}</p>
          <small>Các ký hiệu màu vàng đánh dấu những vật dụng trong Đền Tạm, kèm theo câu Kinh Thánh tham khảo. Một số vị trí trên sơ đồ được phục dựng dựa trên mô tả trong Kinh Thánh, vì bản văn chỉ cho biết vị trí tương đối mà không nêu rõ khoảng cách chính xác.</small>
        </aside>
      )}
    </div>
  )
}

export default function App() {
  const [role, setRole] = useState('people')
  const [started, setStarted] = useState(false)
  const [activeSpot, setActiveSpot] = useState(null)
  const [fact, setFact] = useState(null)
  const [locked, setLocked] = useState(false)
  const [denied, setDenied] = useState('')
  const [touchMode, setTouchMode] = useState(false)
  const nearby = useRef(new Map())
  const deniedTimer = useRef()
  const touchInput = useRef({ keys: new Set(), lookX: 0, lookY: 0 })

  useEffect(() => {
    const media = window.matchMedia('(pointer: coarse)')
    const update = () => setTouchMode(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  const onNear = useCallback((id, distance) => {
    nearby.current.set(id, { distance, at: performance.now() })
  }, [])

  const onDenied = useCallback((message) => {
    setDenied(message)
    window.clearTimeout(deniedTimer.current)
    deniedTimer.current = window.setTimeout(() => setDenied(''), 2400)
  }, [])

  const inspectActive = useCallback(() => {
    if (!activeSpot) return
    document.exitPointerLock?.()
    touchInput.current.keys.clear()
    setFact(FACTS[activeSpot])
  }, [activeSpot])

  useEffect(() => {
    if (!started) return
    const interval = window.setInterval(() => {
      const now = performance.now()
      let closest = null
      for (const [id, value] of nearby.current.entries()) {
        if (now - value.at < 180 && (!closest || value.distance < closest.distance)) closest = { id, ...value }
      }
      setActiveSpot(closest?.id ?? null)
    }, 120)
    const inspect = (event) => {
      if (event.code === 'KeyE' && activeSpot && !fact) inspectActive()
    }
    const clickInspect = () => {
      if (activeSpot && !fact && document.pointerLockElement) inspectActive()
    }
    window.addEventListener('keydown', inspect)
    window.addEventListener('click', clickInspect)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('keydown', inspect)
      window.removeEventListener('click', clickInspect)
      window.clearTimeout(deniedTimer.current)
    }
  }, [started, activeSpot, fact, inspectActive])

  const camera = useMemo(() => ({ position: [0, 1.65, 18.5], fov: 65, near: 0.1, far: 1000 }), [])

  const handleStart = () => {
    setStarted(true)
  }

  return (
    <main className="app">
      <Canvas
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        camera={camera}
        shadows
        dpr={[1, 1.6]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
      >
        <World role={role} started={started} fact={fact} activeSpot={activeSpot} onNear={onNear} onDenied={onDenied} onLockChange={setLocked} touchMode={touchMode} touchInput={touchInput} />
      </Canvas>
      {!started ? <Intro role={role} setRole={setRole} onStart={handleStart} /> : <GameUI role={role} activeSpot={activeSpot} fact={fact} denied={denied} locked={locked} touchMode={touchMode} touchInput={touchInput} onInspect={inspectActive} onCloseFact={() => setFact(null)} onExit={() => { document.exitPointerLock?.(); touchInput.current.keys.clear(); setStarted(false); setFact(null); setLocked(false) }} />}
    </main>
  )
}
