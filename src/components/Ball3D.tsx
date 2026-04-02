import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useBallAnimation } from '../hooks/useBallAnimation'
import type { BallFlightState, Customization, FlightPoint, ScrollStage } from '../types'

type Ball3DProps = {
  scrollStage: ScrollStage
  flight: BallFlightState
  onBallScreenPoint: (point: FlightPoint) => void
  customization?: Customization
  /** Scene lighting keyed to match CSS / ball palette */
  lighting?: {
    keyLight: string
    fillLight: string
    ambient: number
  }
}

function createBasketballShaderMaterial(customization: Customization) {
  const material = new THREE.ShaderMaterial({
    transparent: false,
    depthWrite: true,
    uniforms: {
      uTime: { value: 0 },
      uLightDir: { value: new THREE.Vector3(0.25, 0.78, 0.54).normalize() },
      uBaseColor: { value: new THREE.Color(customization.baseColor || '#ff5a00') },
      uLineColor: { value: new THREE.Color(customization.lineColor || '#2c1810') },
      uTextureType: { value: customization.texture === 'CLASSIC' ? 0 : customization.texture === 'STREET' ? 1 : 2 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vWorldNormal;
      varying vec3 vViewPos;

      void main() {
        vUv = uv;
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorldPos = world.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vec4 viewPos = viewMatrix * world;
        vViewPos = viewPos.xyz;
        gl_Position = projectionMatrix * viewPos;
      }
    `,
    fragmentShader: `
      precision highp float;
      precision highp int;

      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vWorldNormal;
      varying vec3 vViewPos;

      uniform float uTime;
      uniform vec3 uLightDir;
      uniform vec3 uBaseColor;
      uniform vec3 uLineColor;
      uniform int uTextureType;

      #define PI 3.14159265359

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 345.45));
        p += dot(p, p + 34.345);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);

        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));

        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 5; i++) {
          value += noise(p) * amp;
          p = p * 2.01 + vec2(11.4, 7.8);
          amp *= 0.5;
        }
        return value;
      }

      float seamDistance(vec2 uv) {
        float equator = abs(uv.y - 0.5);
        float wave = sin(uv.y * PI);
        float v1 = abs(uv.x - (0.25 + 0.11 * wave));
        float v2 = abs(uv.x - (0.75 - 0.11 * wave));
        return min(equator, min(v1, v2));
      }

      float seamMask(vec2 uv) {
        float d = seamDistance(uv);
        float outer = smoothstep(0.024, 0.010, d);
        float core = smoothstep(0.010, 0.0018, d);
        return max(outer * 0.75, core);
      }

      float leatherHeight(vec2 uv, float time) {
        vec2 drift = vec2(time * 0.018, -time * 0.012);

        float macro = fbm(uv * 8.0 + drift * 0.4);
        float grainA = fbm(uv * 200.0 + drift * 1.35);
        float grainB = fbm(uv * 350.0 - drift * 0.95);
        float grainC = noise(uv * 286.0 + drift * 2.1);
        float grainD = noise(uv * 500.0 - drift * 1.7);

        float pebbles = pow(grainA, 2.2) * 0.52 + pow(grainB, 2.45) * 0.3 + grainC * 0.12 + grainD * 0.06;
        float seam = seamMask(uv);

        float height = macro * 0.12 + pebbles * 0.25;
        height -= seam * 0.42;

        return height;
      }

      vec3 perturbNormal(vec3 normal, vec3 worldPos, vec2 uv, float time) {
        vec3 dp1 = dFdx(worldPos);
        vec3 dp2 = dFdy(worldPos);
        vec2 duv1 = dFdx(uv);
        vec2 duv2 = dFdy(uv);

        vec3 tangent = normalize(dp1 * duv2.y - dp2 * duv1.y);
        vec3 bitangent = normalize(-dp1 * duv2.x + dp2 * duv1.x);

        float eps = 0.003;
        float h = leatherHeight(uv, time);
        float hx = leatherHeight(uv + vec2(eps, 0.0), time);
        float hy = leatherHeight(uv + vec2(0.0, eps), time);
        vec2 grad = vec2((hx - h) / eps, (hy - h) / eps);

        float bumpStrength = 0.08;
        vec3 bumped = normalize(normal - grad.x * tangent * bumpStrength - grad.y * bitangent * bumpStrength);
        return bumped;
      }

      // Функция для генерации текстуры в зависимости от типа
      float getGrain(vec2 uv, float time) {
        float grain;
        
        if(uTextureType == 0) {
          // CLASSIC - гладкая, естественная текстура
          grain = fbm(uv * 200.0 + vec2(time * 0.02, time * 0.015));
          grain = pow(grain, 1.2) * 0.25;
        } 
        else if(uTextureType == 1) {
          // STREET - грубая, уличная текстура
          vec2 grid = fract(uv * 50.0);
          grain = step(0.4, grid.x) * step(0.4, grid.y);
          grain += noise(uv * 180.0) * 0.3;
          grain = clamp(grain, 0.2, 0.8);
        } 
        else {
          // TECH - технологичная, глянцевая текстура
          grain = sin(uv.x * 500.0) * 0.25 + 0.5;
          grain += cos(uv.y * 480.0) * 0.2;
          grain += fbm(uv * 300.0) * 0.15;
          grain = clamp(grain, 0.35, 0.85);
        }
        
        return grain;
      }

      void main() {
        vec2 uv = vUv;
        float time = uTime;

        float seam = seamMask(uv);
        float leather = leatherHeight(uv, time);

        vec3 N = perturbNormal(normalize(vWorldNormal), vWorldPos, uv, time);
        vec3 L = normalize(uLightDir);
        vec3 V = normalize(-vViewPos + vec3(0.0001));
        vec3 H = normalize(L + V);

        vec3 fillDir = normalize(vec3(-0.45, 0.35, 0.9));

        float diffKey = max(dot(N, L), 0.0);
        float diffFill = max(dot(N, fillDir), 0.0) * 0.22;
        float diffuse = diffKey + diffFill;

        float specTight = pow(max(dot(N, H), 0.0), 76.0) * 0.22;
        float specWide = pow(max(dot(N, H), 0.0), 16.0) * 0.12;
        float rim = pow(1.0 - max(dot(N, V), 0.0), 2.8) * 0.22;

        // Динамический шум цвета в зависимости от типа текстуры
        float colorNoise;
        if(uTextureType == 0) {
          colorNoise = fbm(uv * 10.0 + vec2(time * 0.02, 0.0));
        } else if(uTextureType == 1) {
          colorNoise = noise(uv * 25.0 + vec2(time * 0.03, time * 0.01));
        } else {
          colorNoise = sin(uv.x * 40.0 + time) * 0.3 + cos(uv.y * 35.0 - time) * 0.3;
        }
        
        float warmShift = noise(uv * 36.0 + vec2(2.3, 1.7));

        // Применяем кастомные цвета
        vec3 base = uBaseColor;
        base *= 0.82 + leather * 0.26;
        base *= 0.9 + colorNoise * 0.16;
        base += vec3(0.06, 0.015, -0.02) * (warmShift - 0.5);

        // Применяем текстуру
        float grain = getGrain(uv, time);
        base *= (0.85 + grain * 0.25);

        // Цвет швов (линий)
        vec3 seamColor = uLineColor;
        vec3 albedo = mix(base, seamColor, seam);

        float seamAO = mix(1.0, 0.74, seam);
        float light = (0.16 + diffuse) * seamAO;

        vec3 color = albedo * light;
        color += vec3(1.0, 0.93, 0.86) * (specTight + specWide);
        color += uBaseColor * rim * 0.26;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  })

  return material
}

function Basketball({
	scrollStage,
	flight,
	onBallScreenPoint,
	customization,
	lighting,
}: Ball3DProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Создаем материал с кастомизацией
  const material = useMemo(() => {
    const defaultCustomization: Customization = {
      baseColor: '#ff5a00',
      lineColor: '#2c1810',
      texture: 'CLASSIC',
    }
    return createBasketballShaderMaterial(customization || defaultCustomization)
  }, [customization?.baseColor, customization?.lineColor, customization?.texture])

  const pose = useBallAnimation(scrollStage, flight)
  const { viewport, camera, size } = useThree()
  const prevProgressRef = useRef(scrollStage.progress)
  const prevSectionRef = useRef(scrollStage.sectionIndex)
  const rollImpulseRef = useRef(0)
  const rotationAccumXRef = useRef(0)
  const rotationAccumZRef = useRef(0)

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Вычисляем скорость скролла
    const progressDelta = scrollStage.progress - prevProgressRef.current
    prevProgressRef.current = scrollStage.progress

    // Усиленная анимация качения при скролле
    const scrollSpeed = Math.abs(progressDelta)
    const rollIntensity = Math.min(8, scrollSpeed * 35)
    const rollDelta = delta * pose.rollSpeed * 4.5

    // Направление вращения в зависимости от направления скролла
    const direction = progressDelta > 0 ? 1 : -1

    // Добавляем вращение при скролле с усилением
    if (scrollSpeed > 0.002) {
      rotationAccumXRef.current += rollDelta * direction * 1.5 * (1 + rollIntensity)
      rotationAccumZRef.current += rollDelta * direction * 0.8 * (1 + rollIntensity)

      // Ограничиваем накопленное вращение
      rotationAccumXRef.current = Math.min(Math.max(rotationAccumXRef.current, -Math.PI * 2), Math.PI * 2)
      rotationAccumZRef.current = Math.min(Math.max(rotationAccumZRef.current, -Math.PI), Math.PI)
    }

    // Плавное затухание вращения после скролла
    rotationAccumXRef.current *= 0.96
    rotationAccumZRef.current *= 0.96

    if (scrollStage.sectionIndex !== prevSectionRef.current) {
      rollImpulseRef.current = 12
      prevSectionRef.current = scrollStage.sectionIndex

      // Добавляем дополнительный "толчок" при смене секции
      rotationAccumXRef.current += 0.8
      rotationAccumZRef.current += 0.4
    }

    const deltaDrivenImpulse = Math.min(12, Math.abs(progressDelta) * 280)
    rollImpulseRef.current = THREE.MathUtils.damp(
      rollImpulseRef.current,
      deltaDrivenImpulse,
      8,
      delta,
    )

    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uLightDir.value.set(
      0.35 + state.pointer.x * 0.2,
      0.78 + state.pointer.y * 0.12,
      0.56,
    ).normalize()

    // Обновляем позицию мяча
    const target = new THREE.Vector3(
      pose.position[0] * viewport.width * 0.18,
      pose.position[1] * viewport.height * 0.18,
      pose.position[2],
    )
    groupRef.current.position.lerp(target, 1 - Math.exp(-delta * 4.5))

    // Передаем позицию мяча в экранных координатах для анимации "Add to Cart"
    if (onBallScreenPoint && groupRef.current && !flight.isAnimatingToCart) {
      const vector = new THREE.Vector3()
      vector.copy(groupRef.current.position)
      vector.project(camera)

      const x = (vector.x * 0.5 + 0.5) * size.width
      const y = (-(vector.y * 0.5 - 0.5)) * size.height

      if (isFinite(x) && isFinite(y) && x > 0 && x < size.width && y > 0 && y < size.height) {
        onBallScreenPoint({ x, y })
      }
    }

    // Анимация масштаба
    const sectionScaleFactor =
      scrollStage.sectionIndex === 1 || scrollStage.sectionIndex === 2 ? 1 : 0.84
    const targetScale = pose.scale * (flight.isAnimatingToCart ? 0.73 : sectionScaleFactor)
    const scale = THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 5.5, delta)
    groupRef.current.scale.setScalar(scale)

    // Усиленная анимация вращения
    groupRef.current.rotation.y +=
      delta * (0.48 + pose.rotationBoost * 0.24 + rollImpulseRef.current * 0.22)

    const targetRotX = 0.12 + pose.rotationBoost * 0.08 + rotationAccumXRef.current
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetRotX,
      5.5,
      delta,
    )

    const targetRotZ = state.pointer.x * 0.18 + state.pointer.y * 0.09 + rotationAccumZRef.current
    groupRef.current.rotation.z = THREE.MathUtils.damp(
      groupRef.current.rotation.z,
      targetRotZ,
      5.5,
      delta,
    )
  })

  return (
    <>
      <group ref={groupRef}>
        <mesh material={material}>
          <sphereGeometry args={[1, 160, 160]} />
        </mesh>
      </group>

      <ambientLight intensity={lighting?.ambient ?? 0.12} />
      <directionalLight
        position={[2.5, 3.8, 4.6]}
        intensity={1.2}
        color={lighting?.keyLight ?? '#fff3e0'}
      />
      <directionalLight
        position={[-2.8, 1.3, 2.4]}
        intensity={0.32}
        color={lighting?.fillLight ?? '#ffb68a'}
      />
    </>
  )
}

export function Ball3D(props: Ball3DProps) {
  return <Basketball {...props} />
}