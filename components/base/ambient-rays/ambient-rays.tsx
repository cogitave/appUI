'use client';

import { useEffect, useRef } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cx } from '@/utils/cx';

// Original procedural light field. It uses no textures, images or external shaders.
const vertexSource = `attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;
const fragmentSource = `precision mediump float;
uniform vec2 resolution;
uniform float time;
uniform float dark;
uniform vec3 surface;
uniform vec3 blue;
uniform vec3 violet;
uniform vec3 pink;
float hash(vec2 point) { return fract(sin(dot(point, vec2(47.13, 91.71))) * 15437.29); }
float field(vec2 point, vec2 center, vec2 spread) { vec2 distance = (point - center) / spread; return exp(-dot(distance, distance)); }
void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float phase = time * 0.18;
  vec2 flow = vec2(sin(uv.y * 5.0 + phase), cos(uv.x * 4.0 - phase * 0.8)) * 0.045;
  vec2 point = uv + flow;
  float a = field(point, vec2(0.20 + sin(phase) * 0.13, 0.78 + cos(phase * 0.7) * 0.12), vec2(0.27, 0.24));
  float b = field(point, vec2(0.70 + cos(phase * 0.8) * 0.14, 0.83 + sin(phase * 0.9) * 0.10), vec2(0.29, 0.23));
  float c = field(point, vec2(0.55 + sin(phase * 0.6 + 2.0) * 0.19, 0.47 + cos(phase) * 0.16), vec2(0.35, 0.18));
  float weight = a + b + c;
  vec3 light = (blue * a + violet * b + pink * c) / max(weight, 0.001);
  float fade = smoothstep(0.08, 0.65, uv.y);
  float strength = min(weight, 1.0) * fade * mix(0.14, 0.22, dark);
  float grain = (hash(mod(gl_FragCoord.xy, vec2(64.0))) - 0.5) * mix(0.016, 0.011, dark);
  gl_FragColor = vec4(clamp(mix(surface, light, strength) + grain, 0.0, 1.0), 1.0);
}`;

export function AmbientRays({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const host = hostRef.current, canvas = canvasRef.current;
    if (!host || !canvas) return;
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
    if (!gl) return;
    let program: WebGLProgram | null = null, buffer: WebGLBuffer | null = null;
    let frame = 0, visible = false, lost = false, lastFrame = 0;
    const started = performance.now();
    const locations: Record<string, WebGLUniformLocation | null> = {};

    function initialize() {
      if (!gl) return false;
      const shaders = [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].map((kind, index) => {
        const shader = gl.createShader(kind);
        if (!shader) return null;
        gl.shaderSource(shader, index === 0 ? vertexSource : fragmentSource); gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
        return shader;
      });
      if (shaders.some(shader => !shader)) { shaders.forEach(shader => { if (shader) gl.deleteShader(shader); }); return false; }
      program = gl.createProgram();
      if (!program) { shaders.forEach(shader => gl.deleteShader(shader)); return false; }
      shaders.forEach(shader => gl.attachShader(program!, shader!)); gl.linkProgram(program);
      shaders.forEach(shader => gl.deleteShader(shader));
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); program = null; return false; }
      gl.useProgram(program); buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      ['resolution', 'time', 'dark', 'surface', 'blue', 'violet', 'pink'].forEach(name => { locations[name] = gl.getUniformLocation(program!, name); });
      return true;
    }
    function updateColors() {
      if (!gl || !program || lost) return;
      gl.useProgram(program);
      const probe = document.createElement('span'); probe.style.display = 'none'; host!.appendChild(probe);
      for (const [name, token] of [['surface', '--surface-base'], ['blue', '--chart-blue'], ['violet', '--chart-violet'], ['pink', '--chart-pink']]) {
        probe.style.color = `var(${token})`;
        const rgb = getComputedStyle(probe).color.match(/[\d.]+/g)?.slice(0, 3).map(value => Number(value) / 255) ?? [0, 0, 0];
        gl.uniform3f(locations[name], rgb[0], rgb[1], rgb[2]);
      }
      probe.remove(); gl.uniform1f(locations.dark, document.documentElement.classList.contains('dark') ? 1 : 0);
    }
    function draw(timestamp = performance.now()) {
      if (!gl || !program || lost) return;
      gl.uniform1f(locations.time, reducedMotion ? 0 : (timestamp - started) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6); canvas!.dataset.ready = 'true';
    }
    function resize() {
      if (!gl || lost || !program) return;
      const bounds = host!.getBoundingClientRect(), ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas!.width = Math.max(1, Math.round(bounds.width * ratio)); canvas!.height = Math.max(1, Math.round(bounds.height * ratio));
      gl.viewport(0, 0, canvas!.width, canvas!.height); gl.uniform2f(locations.resolution, canvas!.width, canvas!.height); draw();
    }
    function tick(timestamp: number) {
      if (timestamp - lastFrame >= 1000 / 30) { draw(timestamp); lastFrame = timestamp; }
      frame = requestAnimationFrame(tick);
    }
    function playback() {
      cancelAnimationFrame(frame);
      if (!lost && program && visible && !document.hidden && !reducedMotion) frame = requestAnimationFrame(tick);
    }
    function contextLost(event: Event) { event.preventDefault(); lost = true; canvas!.dataset.ready = 'false'; playback(); }
    function contextRestored() { lost = false; if (initialize()) { updateColors(); resize(); playback(); } }
    if (!initialize()) return;
    updateColors(); resize();
    const size = new ResizeObserver(resize); size.observe(host);
    const viewport = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; playback(); }); viewport.observe(host);
    const appearance = new MutationObserver(() => { updateColors(); draw(); }); appearance.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-accent'] });
    document.addEventListener('visibilitychange', playback); canvas.addEventListener('webglcontextlost', contextLost); canvas.addEventListener('webglcontextrestored', contextRestored);
    return () => {
      cancelAnimationFrame(frame); size.disconnect(); viewport.disconnect(); appearance.disconnect();
      document.removeEventListener('visibilitychange', playback); canvas.removeEventListener('webglcontextlost', contextLost); canvas.removeEventListener('webglcontextrestored', contextRestored);
      gl.deleteBuffer(buffer); gl.deleteProgram(program); canvas.dataset.ready = 'false';
    };
  }, [reducedMotion]);

  return <div ref={hostRef} className={cx('ui-ambient-rays', className)} aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
